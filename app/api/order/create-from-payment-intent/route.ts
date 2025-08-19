import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { getStripeKeys } from '@/lib/stripe/config'

const stripeConfig = getStripeKeys()
if (!stripeConfig.secretKey) {
  throw new Error('Stripe secret key is not configured')
}
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { payment_intent_id } = await request.json()

    if (!payment_intent_id) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 })
    }

    console.log('Create Order API - Processing payment intent:', payment_intent_id)

    // First, check if order already exists
    const supabase = createServiceClient()
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent_id', payment_intent_id)
      .single()

    if (existingOrder) {
      console.log('Create Order API - Order already exists:', existingOrder.id)
      return NextResponse.json({ 
        success: true, 
        order_id: existingOrder.id,
        message: 'Order already exists'
      })
    }

    // Retrieve payment intent from Stripe with charges to get shipping info
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id, {
      expand: ['charges.data.billing_details', 'charges.data.shipping']
    })

    console.log('Create Order API - Payment intent status:', paymentIntent.status)
    console.log('Create Order API - Payment intent amount:', paymentIntent.amount)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ 
        error: 'Payment intent not succeeded',
        status: paymentIntent.status 
      }, { status: 400 })
    }

    // Extract order data from payment intent metadata
    const metadata = paymentIntent.metadata
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
          console.error('Create Order API - Error creating user profile:', userError)
        } else {
          userId = newUser.id
        }
      }
    }

    // Get shipping address from payment intent metadata first, then try charges
    let shippingAddress = {
      name: metadata.shipping_name || metadata.customer_name,
      email: metadata.shipping_email || customerEmail,
      phone: metadata.shipping_phone || metadata.customer_phone || '',
      address: metadata.shipping_address1 || '',
      address2: metadata.shipping_address2 || '',
      city: metadata.shipping_city || '',
      state: metadata.shipping_state || '',
      zip: metadata.shipping_zip || '',
      country: metadata.shipping_country || 'US'
    }

    console.log('Create Order API - Shipping address from metadata:', {
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.zip
    })

    // If no address in metadata, try to get from charges as fallback
    if (!shippingAddress.address && (paymentIntent as any).charges && (paymentIntent as any).charges.data.length > 0) {
      const charge = (paymentIntent as any).charges.data[0]
      const shipping = charge.shipping
      const billing = charge.billing_details

      if (shipping && shipping.address) {
        shippingAddress = {
          ...shippingAddress,
          address: shipping.address.line1,
          address2: shipping.address.line2 || '',
          city: shipping.address.city,
          state: shipping.address.state,
          zip: shipping.address.postal_code,
          country: shipping.address.country,
        }
        console.log('Create Order API - Using shipping address from charge as fallback')
      } else if (billing && billing.address) {
        shippingAddress = {
          ...shippingAddress,
          address: billing.address.line1,
          address2: billing.address.line2 || '',
          city: billing.address.city,
          state: billing.address.state,
          zip: billing.address.postal_code,
          country: billing.address.country,
        }
        console.log('Create Order API - Using billing address as fallback')
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: paymentIntent.amount / 100, // Convert from cents
        status: 'completed',
        shipping_address: shippingAddress,
        payment_intent_id: paymentIntent.id
      })
      .select()
      .single()

    if (orderError) {
      console.error('Create Order API - Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    console.log('Create Order API - Order created successfully:', order.id)

    // Create order items from metadata
    if (metadata.items_data) {
      try {
        const cartItems = JSON.parse(metadata.items_data)
        console.log('Create Order API - Processing cart items:', cartItems.length)

        // Map the shortened cart items back to full product data
        const orderItems = []
        for (const item of cartItems) {
          let product = null
          
          // Try to find product by ID first
          if (item.id && item.id.length > 10) { // UUIDs are longer than product names
            const { data: productById } = await supabase
              .from('products')
              .select('id, name, price')
              .eq('id', item.id)
              .single()
            product = productById
          }
          
          // If not found by ID, try by name
          if (!product && item.name) {
            const { data: productByName } = await supabase
              .from('products')
              .select('id, name, price')
              .eq('name', item.name)
              .single()
            product = productByName
          }

          if (product) {
            orderItems.push({
              order_id: order.id,
              product_id: product.id,
              quantity: item.q,
              price: item.p
            })
            console.log('Create Order API - Product found:', product.name, 'ID:', product.id)
          } else {
            console.warn('Create Order API - Product not found by ID or name:', item.id)
          }
        }

        if (orderItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

          if (itemsError) {
            console.error('Create Order API - Error creating order items:', itemsError)
          } else {
            console.log('Create Order API - Order items created:', orderItems.length)
          }
        }
      } catch (parseError) {
        console.error('Create Order API - Error parsing cart items:', parseError)
      }
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      message: 'Order created successfully'
    })

  } catch (error) {
    console.error('Create Order API - Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}