import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeKeys } from '@/lib/stripe/config'

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
    const body = await request.json()
    
    // Check if this is a subscription request (has planId) or product purchase (has items)
    if (body.planId && body.billingCycle) {
      // Handle subscription checkout
      const { planId, billingCycle } = body

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

      // Create Stripe checkout session for subscription
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
    } else if (body.items) {
      // Handle product purchase
      const { items, customer_details, shipping_cost, tax_amount, success_url, cancel_url } = body

      if (!items || items.length === 0) {
        return NextResponse.json(
          { error: 'No items provided' },
          { status: 400 }
        )
      }

      // Create line items for Stripe
      const line_items = items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.size && item.color ? `Size: ${item.size}, Color: ${item.color}` : 
                        item.size ? `Size: ${item.size}` :
                        item.color ? `Color: ${item.color}` : undefined,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }))

      // Add shipping as a line item if there's a cost
      if (shipping_cost > 0) {
        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping',
              description: 'Shipping and handling',
            },
            unit_amount: Math.round(shipping_cost * 100),
          },
          quantity: 1,
        })
      }

      // Add tax as a line item if there's a cost
      if (tax_amount > 0) {
        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tax',
              description: 'Sales tax',
            },
            unit_amount: Math.round(tax_amount * 100),
          },
          quantity: 1,
        })
      }

      // Create Stripe checkout session for products
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items,
        success_url: success_url || `${process.env.NEXT_PUBLIC_APP_URL}/shop/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_APP_URL}/shop/checkout`,
        customer_email: customer_details?.email,
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
        billing_address_collection: 'required',
        metadata: {
          order_type: 'product_purchase',
          customer_name: customer_details?.name,
          customer_phone: customer_details?.phone,
          customer_email: customer_details?.email,
          items_data: JSON.stringify(items), // Include cart items for webhook
        },
      })

      return NextResponse.json({ url: session.url })
    } else {
      return NextResponse.json(
        { error: 'Invalid request - missing planId/billingCycle or items' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}