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
    },
    yearly: {
      priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_premium_yearly',
      amount: 10000, // $100.00 in cents
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle, customer_details } = await request.json()

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing planId or billingCycle' },
        { status: 400 }
      )
    }

    if (planId === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require payment setup' },
        { status: 400 }
      )
    }

    const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS]
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const config = planConfig[billingCycle as keyof typeof planConfig]
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      )
    }

    // Create or retrieve customer
    let customer
    try {
      const customers = await stripe.customers.list({
        email: customer_details?.email,
        limit: 1
      })

      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: customer_details?.email,
          name: customer_details?.name,
          metadata: {
            planId,
            billingCycle,
          }
        })
      }
    } catch (error) {
      console.error('Error creating/finding customer:', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // Create Setup Intent for subscription
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        planId,
        billingCycle,
        plan_name: 'HoopMetrix Premium',
        customer_email: customer_details?.email || '',
        customer_name: customer_details?.name || '',
      }
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
      setupIntentId: setupIntent.id,
      planId,
      billingCycle,
      amount: config.amount,
    })

  } catch (error) {
    console.error('Error creating subscription setup intent:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription setup intent' },
      { status: 500 }
    )
  }
}