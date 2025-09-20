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

    // Get the correct price ID based on plan and billing cycle
    let priceId: string
    if (billingCycle === 'monthly') {
      priceId = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_1RsuYgCYWJCJQ2h3qpA2ol9x'
    } else {
      priceId = process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_1S9Y7cCYWJCJQ2h3ZIHVo8TM'
    }

    console.log('Using price ID:', priceId, 'for billing cycle:', billingCycle)

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId,
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

    console.log('Confirm subscription - starting user profile update process')
    console.log('Customer ID:', customerId)
    
    // Update user profile in Supabase by customer email (most reliable approach)
    try {
      const supabase = createServiceClient()
      
      // Get customer email from Stripe
      console.log('Retrieving customer from Stripe with ID:', customerId)
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