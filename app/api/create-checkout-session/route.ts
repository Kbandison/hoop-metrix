import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
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
    const { planId, billingCycle } = await request.json()

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing planId or billingCycle' },
        { status: 400 }
      )
    }

    if (planId === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require checkout' },
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

    const interval = billingCycle === 'monthly' ? 'month' : 'year'
    const config = planConfig[billingCycle as keyof typeof planConfig]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'HoopMetrix Premium',
              description: 'Complete basketball encyclopedia access',
              images: [`${process.env.NEXT_PUBLIC_APP_URL}/HM_logo_black.png`],
            },
            unit_amount: config.amount,
            recurring: {
              interval: interval as 'month' | 'year',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership?canceled=true`,
      customer_email: undefined, // Let user enter email
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        planId,
        billingCycle,
        plan_name: 'HoopMetrix Premium',
      },
      subscription_data: {
        metadata: {
          planId,
          billingCycle,
          plan_name: 'HoopMetrix Premium',
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}