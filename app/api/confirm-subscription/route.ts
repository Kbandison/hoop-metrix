import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeKeys } from '@/lib/stripe/config'
import { createServiceClient } from '@/lib/supabase/server'

const stripeConfig = getStripeKeys()
if (!stripeConfig.secretKey) {
  throw new Error('Stripe secret key is not configured')
}
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2025-06-30.basil',
})

// Plan configurations
const PLAN_CONFIGS = {
  premium: {
    monthly: {
      priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_monthly',
      amount: 1000, // $10.00 in cents
      interval: 'month' as const,
    },
    yearly: {
      priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_premium_yearly',
      amount: 10000, // $100.00 in cents
      interval: 'year' as const,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { setupIntentId, customerId, planId, billingCycle } = await request.json()

    if (!setupIntentId || !customerId || !planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Retrieve the setup intent to get the payment method
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
    
    if (setupIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Setup intent not succeeded' },
        { status: 400 }
      )
    }

    const paymentMethodId = setupIntent.payment_method as string
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'No payment method found' },
        { status: 400 }
      )
    }

    const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS]
    const config = planConfig[billingCycle as keyof typeof planConfig]

    // First create/find a product 
    let product
    try {
      const products = await stripe.products.list({
        active: true,
        limit: 10
      })
      
      product = products.data.find(p => p.name === 'HoopMetrix Premium')
      
      if (!product) {
        product = await stripe.products.create({
          name: 'HoopMetrix Premium',
          description: 'Complete basketball database access',
          active: true,
        })
      }
    } catch (error) {
      console.error('Error creating/finding product:', error)
      product = await stripe.products.create({
        name: 'HoopMetrix Premium',
        description: 'Complete basketball database access',
        active: true,
      })
    }

    // Find existing price or create new one
    let price
    try {
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 10
      })
      
      price = prices.data.find(p => 
        p.unit_amount === config.amount && 
        p.recurring?.interval === config.interval
      )
      
      if (!price) {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: config.amount,
          currency: 'usd',
          recurring: {
            interval: config.interval,
          },
          active: true,
        })
      }
    } catch (error) {
      console.error('Error creating/finding price:', error)
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: config.amount,
        currency: 'usd',
        recurring: {
          interval: config.interval,
        },
        active: true,
      })
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: price.id,
      }],
      default_payment_method: paymentMethodId,
      metadata: {
        planId,
        billingCycle,
        plan_name: 'HoopMetrix Premium',
      },
      expand: ['latest_invoice.payment_intent'],
    })
    
    console.log('Created subscription:', {
      id: subscription.id,
      status: subscription.status,
      current_period_end: (subscription as any).current_period_end,
      current_period_start: (subscription as any).current_period_start
    })

    // Update user profile in Supabase by customer email (most reliable approach)
    try {
      const supabase = await createServiceClient()
      
      // Get customer email from Stripe
      const customer = await stripe.customers.retrieve(customerId)
      console.log('Retrieved customer from Stripe:', { 
        id: customer?.id, 
        email: customer && !customer.deleted ? customer.email : 'no email',
        deleted: customer?.deleted 
      })
      
      if (customer && !customer.deleted && customer.email) {
        console.log('Attempting to update user profile for email:', customer.email)
        
        // First check if user exists
        const { data: existingUser, error: findError } = await supabase
          .from('user_profiles')
          .select('id, email, membership_status')
          .eq('email', customer.email)
          .single()
          
        console.log('Existing user found:', existingUser, 'Error:', findError)
        
        if (existingUser) {
          // Get the current period end safely
          const currentPeriodEnd = (subscription as any).current_period_end
          let membershipExpiresAt = null
          
          if (currentPeriodEnd && !isNaN(currentPeriodEnd)) {
            membershipExpiresAt = new Date(currentPeriodEnd * 1000).toISOString()
          } else {
            console.warn('Invalid current_period_end from subscription:', currentPeriodEnd)
            // Set to 1 month from now as fallback
            const oneMonthFromNow = new Date()
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
            membershipExpiresAt = oneMonthFromNow.toISOString()
          }
          
          console.log('Setting membership_expires_at to:', membershipExpiresAt)
          
          const { data: updateData, error: updateError } = await supabase
            .from('user_profiles')
            .update({
              membership_status: 'premium',
              stripe_customer_id: customerId,
              membership_expires_at: membershipExpiresAt,
            })
            .eq('email', customer.email)
            .select()
            
          console.log('Update result:', updateData, 'Error:', updateError)
          
          if (updateError) {
            console.error('Error updating user profile:', updateError)
            // Still return success since Stripe subscription was created
          } else {
            console.log('Successfully updated user profile to premium status:', updateData)
          }
        } else {
          console.error('No user found with email:', customer.email)
        }
      } else {
        console.error('Could not retrieve customer email from Stripe:', customer)
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      // Don't fail the request if profile update fails - subscription was created successfully
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customerId,
      status: subscription.status,
      currentPeriodEnd: (subscription as any).current_period_end,
    })

  } catch (error) {
    console.error('Error confirming subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}