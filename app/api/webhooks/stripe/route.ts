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

        // Update user membership status
        const { error } = await supabase
          .from('user_profiles')
          .update({
            membership_status: subscription.status === 'active' ? 'premium' : 'free',
            membership_expires_at: subscription.status === 'active' 
              ? new Date((subscription as any).current_period_end * 1000).toISOString()
              : null
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Error updating user membership:', error)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
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
        
        // Handle one-time payment success
        // You can add order fulfillment logic here
        // Payment succeeded - order fulfillment logic can be added here
        
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