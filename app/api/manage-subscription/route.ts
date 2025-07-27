import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { customerId, action } = await request.json()

    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing customerId' },
        { status: 400 }
      )
    }

    let url: string

    switch (action) {
      case 'manage': {
        // Create a billing portal session for subscription management
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        })
        url = session.url
        break
      }

      case 'cancel': {
        // Get customer's active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
        })

        if (subscriptions.data.length === 0) {
          return NextResponse.json(
            { error: 'No active subscription found' },
            { status: 404 }
          )
        }

        // Cancel the first active subscription
        const subscription = subscriptions.data[0]
        await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
        })

        return NextResponse.json({ 
          success: true, 
          message: 'Subscription will be canceled at the end of the current period' 
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error managing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    )
  }
}