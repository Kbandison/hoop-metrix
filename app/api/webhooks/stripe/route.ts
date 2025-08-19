import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const event = verifyWebhookSignature(body, signature)
    const supabase = createServiceClient()

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        console.log(`Webhook: ${event.type} for customer ${customerId}, subscription ${subscription.id}, status: ${subscription.status}`)

        // Update user membership status by stripe_customer_id first
        const { error: customerIdError } = await supabase
          .from('user_profiles')
          .update({
            membership_status: subscription.status === 'active' ? 'premium' : 'free',
            stripe_customer_id: customerId,
            membership_expires_at: subscription.status === 'active' 
              ? new Date((subscription as any).current_period_end * 1000).toISOString()
              : null
          })
          .eq('stripe_customer_id', customerId)

        if (customerIdError) {
          console.log('Could not update by stripe_customer_id, trying by email...')
          
          // Try to update by customer email as fallback
          try {
            const { getStripeKeys } = await import('@/lib/stripe/config')
            const stripeConfig = getStripeKeys()
            if (!stripeConfig.secretKey) {
              throw new Error('Stripe secret key is not configured')
            }
            const { default: Stripe } = await import('stripe')
            const stripe = new Stripe(stripeConfig.secretKey, { apiVersion: '2025-06-30.basil' })
            
            const customer = await stripe.customers.retrieve(customerId)
            
            if (customer && !customer.deleted && customer.email) {
              console.log(`Updating user profile by email: ${customer.email}`)
              const { error: emailError } = await supabase
                .from('user_profiles')
                .update({
                  membership_status: subscription.status === 'active' ? 'premium' : 'free',
                  stripe_customer_id: customerId,
                  membership_expires_at: subscription.status === 'active' 
                    ? new Date((subscription as any).current_period_end * 1000).toISOString()
                    : null
                })
                .eq('email', customer.email)
                
              if (emailError) {
                console.error('Error updating user membership by email:', emailError)
                return NextResponse.json({ error: 'Database error' }, { status: 500 })
              } else {
                console.log('Successfully updated user profile by email')
              }
            }
          } catch (stripeError) {
            console.error('Error retrieving customer from Stripe:', stripeError)
            return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
          }
        } else {
          console.log('Successfully updated user profile by stripe_customer_id')
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        // Set membership to free
        const { error } = await supabase
          .from('user_profiles')
          .update({
            membership_status: 'free',
            membership_expires_at: null
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Error updating user membership:', error)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('Webhook - Payment intent succeeded:', paymentIntent.id)
        
        // Extract order data from payment intent metadata
        const metadata = paymentIntent.metadata
        if (metadata.order_type === 'product_purchase') {
          // Get or create user profile for guest checkout
          const customerEmail = metadata.customer_email
          let userId = null

          if (customerEmail) {
            // Try to find existing user by email
            const { data: existingUser } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('email', customerEmail)
              .single()

            if (existingUser) {
              userId = existingUser.id
            } else {
              // Create guest user profile
              const { data: newUser, error: userError } = await supabase
                .from('user_profiles')
                .insert({
                  email: customerEmail,
                  full_name: metadata.customer_name,
                  membership_status: 'free'
                })
                .select('id')
                .single()

              if (userError) {
                console.error('Error creating user profile:', userError)
                // Continue without user_id for guest orders
              } else {
                userId = newUser.id
              }
            }
          }

          // Create shipping address object
          const shippingAddress = {
            name: metadata.customer_name,
            email: customerEmail
          }

          // Create order (try with payment_intent_id first, fallback without it)
          let orderData, orderError
          
          try {
            const { data, error } = await supabase
              .from('orders')
              .insert({
                user_id: userId,
                total_amount: paymentIntent.amount / 100, // Convert from cents
                status: 'completed',
                shipping_address: shippingAddress,
                payment_intent_id: paymentIntent.id
              })
              .select('id')
              .single()
            
            orderData = data
            orderError = error
          } catch (e) {
            console.log('Webhook - payment_intent_id column does not exist, creating order without it')
            
            const { data, error } = await supabase
              .from('orders')
              .insert({
                user_id: userId,
                total_amount: paymentIntent.amount / 100, // Convert from cents
                status: 'completed',
                shipping_address: shippingAddress
              })
              .select('id')
              .single()
            
            orderData = data
            orderError = error
          }
          
          const order = orderData

          if (orderError) {
            console.error('Error creating order:', orderError)
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
          }

          console.log('Webhook - Order created successfully:', order?.id)

          // Create order items if cart data is available
          if (metadata.items_data) {
            try {
              const cartItems = JSON.parse(metadata.items_data)
              const orderItems = cartItems.map((item: any) => ({
                order_id: order?.id,
                product_id: item.id, // This should be the product ID from your products table
                quantity: item.quantity,
                price: item.price
              }))

              const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

              if (itemsError) {
                console.error('Error creating order items:', itemsError)
              } else {
                console.log('Webhook - Order items created:', orderItems.length)
              }
            } catch (parseError) {
              console.error('Error parsing cart items from metadata:', parseError)
            }
          }
        }
        
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        
        // Handle payment failure
        // Payment failed - notification logic can be added here
        
        break
      }

      default:
        // Unhandled event type - can be logged for future implementation
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}