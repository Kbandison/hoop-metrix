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

// Helper function to get price ID from product ID if needed
async function getPriceId(identifier: string, billingCycle: string): Promise<{ priceId: string, amount: number }> {
  // If it's already a price ID, return it
  if (identifier.startsWith('price_')) {
    const price = await stripe.prices.retrieve(identifier)
    return {
      priceId: identifier,
      amount: price.unit_amount || 0
    }
  }
  
  // If it's a product ID, find the associated price
  if (identifier.startsWith('prod_')) {
    const prices = await stripe.prices.list({
      product: identifier,
      active: true
    })
    
    // Find the price with the correct billing cycle
    const targetInterval = billingCycle === 'monthly' ? 'month' : 'year'
    const matchingPrice = prices.data.find(price => 
      price.recurring?.interval === targetInterval
    )
    
    if (matchingPrice) {
      return {
        priceId: matchingPrice.id,
        amount: matchingPrice.unit_amount || 0
      }
    }
  }
  
  // Fallback: use default amounts
  const defaultAmount = billingCycle === 'monthly' ? 1000 : 10000 // $10 or $100
  return {
    priceId: identifier, // This will fail with Stripe, but at least we tried
    amount: defaultAmount
  }
}

// Plan configurations
const PLAN_CONFIGS = {
  premium: {
    monthly: {
      identifier: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_monthly',
      defaultAmount: 1000, // $10.00 in cents
    },
    yearly: {
      identifier: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_premium_yearly',
      defaultAmount: 10000, // $100.00 in cents
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

    // Resolve the actual price ID and amount
    const { priceId, amount } = await getPriceId(config.identifier, billingCycle)

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
        priceId,
        amount: amount.toString(),
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
      amount: amount,
      priceId: priceId,
    })

  } catch (error) {
    console.error('Error creating subscription setup intent:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription setup intent' },
      { status: 500 }
    )
  }
}