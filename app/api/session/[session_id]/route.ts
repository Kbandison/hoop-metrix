import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id } = await params

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    console.log('Session API - Looking up session:', session_id)

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)

    console.log('Session API - Session status:', session.status)
    console.log('Session API - Payment intent:', session.payment_intent)

    if (session.status !== 'complete') {
      return NextResponse.json({ 
        error: 'Session not complete',
        status: session.status 
      }, { status: 400 })
    }

    if (!session.payment_intent) {
      return NextResponse.json({ 
        error: 'No payment intent found in session' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      payment_intent: session.payment_intent,
      session_status: session.status
    })

  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}