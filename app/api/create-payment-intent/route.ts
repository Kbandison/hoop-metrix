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
    console.log('Payment Intent API - Is sandbox mode:', stripeConfig.isSandboxMode)
    console.log('Payment Intent API - Using publishable key prefix:', stripeConfig.publishableKey?.substring(0, 12))
    console.log('Payment Intent API - Using secret key prefix:', stripeConfig.secretKey?.substring(0, 12))
    console.log('Payment Intent API - Account ID from secret key:', stripeConfig.secretKey?.substring(8, 28))
    
    // Verify Stripe account by attempting to retrieve account info
    try {
      const account = await stripe.accounts.retrieve()
      console.log('Payment Intent API - Stripe account verified:', account.id)
      console.log('Payment Intent API - Account type:', account.type)
      console.log('Payment Intent API - Account country:', account.country)
    } catch (accountError) {
      console.error('Payment Intent API - Failed to verify Stripe account:', accountError)
    }
    
    const { items, customer_details, shipping_address, shipping_cost, tax_amount } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Calculate total amount with detailed logging
    console.log('Payment Intent API - Items received:', JSON.stringify(items, null, 2))
    console.log('Payment Intent API - Shipping cost:', shipping_cost)
    console.log('Payment Intent API - Tax amount:', tax_amount)
    
    const itemsTotal = items.reduce((sum: number, item: any) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0)
      console.log(`Payment Intent API - Item ${item.name}: price=${item.price}, qty=${item.quantity}, total=${itemTotal}`)
      return sum + itemTotal
    }, 0)
    
    console.log('Payment Intent API - Items total:', itemsTotal)
    const totalAmount = itemsTotal + (shipping_cost || 0) + (tax_amount || 0)
    console.log('Payment Intent API - Final total amount:', totalAmount)

    if (totalAmount <= 0) {
      console.error('Payment Intent API - Invalid total amount:', totalAmount)
      return NextResponse.json(
        { error: `Invalid total amount: ${totalAmount}. Items total: ${itemsTotal}, shipping: ${shipping_cost}, tax: ${tax_amount}` },
        { status: 400 }
      )
    }

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