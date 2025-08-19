import Stripe from 'stripe'
import { getStripeKeys } from './config'

const stripeConfig = getStripeKeys()
if (!stripeConfig.secretKey) {
  throw new Error('Stripe secret key is not configured')
}
export const stripe = new Stripe(stripeConfig.secretKey, {
  typescript: true,
})

// Helper function to create a customer
export async function createStripeCustomer(email: string, name?: string) {
  return await stripe.customers.create({
    email,
    name,
  })
}

// Helper function to create a subscription
export async function createSubscription(customerId: string, priceId: string) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  })
}

// Helper function to create a payment intent for one-time purchases
export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    automatic_payment_methods: { enabled: true },
  })
}

// Helper function to verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string) {
  if (!stripeConfig.webhookSecret) {
    throw new Error('Stripe webhook secret is not configured')
  }
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    stripeConfig.webhookSecret
  )
}