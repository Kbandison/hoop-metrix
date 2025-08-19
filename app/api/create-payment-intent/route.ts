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

export async function POST(request: NextRequest) {
  try {
    console.log('Payment Intent API - Stripe config mode:', stripeConfig.mode)
    console.log('Payment Intent API - Using publishable key prefix:', stripeConfig.publishableKey?.substring(0, 12))
    console.log('Payment Intent API - Using secret key prefix:', stripeConfig.secretKey?.substring(0, 12))
    console.log('Payment Intent API - Account ID from secret key:', stripeConfig.secretKey?.substring(8, 28))
    
    const { items, customer_details, shipping_address, shipping_cost, tax_amount } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const totalAmount = itemsTotal + (shipping_cost || 0) + (tax_amount || 0)

    // Create payment intent
    console.log('Payment Intent API - Creating payment intent for amount:', Math.round(totalAmount * 100), 'cents')
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_type: 'product_purchase',
        customer_name: customer_details?.name || '',
        customer_email: customer_details?.email || '',
        customer_phone: customer_details?.phone || '',
        // Shipping address
        shipping_name: shipping_address?.name || customer_details?.name || '',
        shipping_email: shipping_address?.email || customer_details?.email || '',
        shipping_phone: shipping_address?.phone || customer_details?.phone || '',
        shipping_address1: shipping_address?.address1 || '',
        shipping_address2: shipping_address?.address2 || '',
        shipping_city: shipping_address?.city || '',
        shipping_state: shipping_address?.state || '',
        shipping_zip: shipping_address?.zipCode || '',
        shipping_country: shipping_address?.country || 'US',
        items_count: items.length.toString(),
        // Store only essential item data to stay under 500 char limit
        items_data: JSON.stringify(items.map((item: any) => ({
          id: item.id, // Always use product ID
          name: item.name, // Keep name for backup lookup
          q: item.quantity,
          p: item.price
        }))),
        subtotal: itemsTotal.toString(),
        shipping: (shipping_cost || 0).toString(),
        tax: (tax_amount || 0).toString(),
      },
    })

    console.log('Payment Intent API - Created payment intent:', paymentIntent.id)
    console.log('Payment Intent API - Account ID from PI:', paymentIntent.id.substring(3, 23)) // Extract account ID from PI ID

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}