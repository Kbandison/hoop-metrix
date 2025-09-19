/**
 * Stripe Configuration Utility
 * Automatically selects sandbox or live keys based on STRIPE_MODE environment variable
 * Supports both 'sandbox' and 'test' modes for backward compatibility
 */

export const getStripeKeys = () => {
  // Force sandbox mode if no live keys are available
  const mode = process.env.STRIPE_MODE || 'sandbox'
  const hasLiveKeys = !!(process.env.STRIPE_LIVE_PUBLISHABLE_KEY && process.env.STRIPE_LIVE_SECRET_KEY)
  const isSandboxMode = mode === 'sandbox' || mode === 'test' || !hasLiveKeys // Support both terms

  const config = {
    publishableKey: isSandboxMode 
      ? process.env.STRIPE_TEST_PUBLISHABLE_KEY 
      : process.env.STRIPE_LIVE_PUBLISHABLE_KEY,
    
    secretKey: isSandboxMode 
      ? process.env.STRIPE_TEST_SECRET_KEY 
      : process.env.STRIPE_LIVE_SECRET_KEY,
    
    webhookSecret: isSandboxMode 
      ? process.env.STRIPE_TEST_WEBHOOK_SECRET 
      : process.env.STRIPE_LIVE_WEBHOOK_SECRET,
    
    mode: mode as 'sandbox' | 'test' | 'live',
    isSandboxMode,
    isTestMode: isSandboxMode // Backward compatibility
  }

  // Validation
  if (!config.publishableKey) {
    throw new Error(`Missing Stripe publishable key for ${mode} mode`)
  }
  
  if (!config.secretKey) {
    throw new Error(`Missing Stripe secret key for ${mode} mode`)
  }

  if (!config.webhookSecret) {
    console.warn(`Missing Stripe webhook secret for ${mode} mode - webhooks may not work`)
  }

  return config
}

// Client-side configuration (only publishable key)
export const getClientStripeConfig = () => {
  const mode = process.env.NEXT_PUBLIC_STRIPE_MODE || process.env.STRIPE_MODE || 'sandbox'
  const hasLiveKeys = !!(process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.STRIPE_LIVE_PUBLISHABLE_KEY)
  const isSandboxMode = mode === 'sandbox' || mode === 'test' || !hasLiveKeys // Support both terms

  console.log('Client Config - Mode:', mode)
  console.log('Client Config - NEXT_PUBLIC_STRIPE_MODE:', process.env.NEXT_PUBLIC_STRIPE_MODE)
  console.log('Client Config - Available env vars:', {
    testKey: process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY?.substring(0, 12),
    liveKey: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY?.substring(0, 12)
  })

  const publishableKey = isSandboxMode 
    ? process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY || process.env.STRIPE_TEST_PUBLISHABLE_KEY
    : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.STRIPE_LIVE_PUBLISHABLE_KEY

  console.log('Client Config - Selected publishable key:', publishableKey?.substring(0, 12))

  if (!publishableKey) {
    throw new Error(`Missing Stripe publishable key for ${mode} mode`)
  }

  return {
    publishableKey,
    mode: mode as 'sandbox' | 'test' | 'live',
    isSandboxMode,
    isTestMode: isSandboxMode // Backward compatibility
  }
}

// Test card numbers for development
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINE: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069',
  CVC_FAIL: '4000000000000127',
  PROCESSING_ERROR: '4000000000000119'
} as const

export const getTestCardInfo = () => ({
  cards: TEST_CARDS,
  instructions: {
    number: 'Use any test card number above',
    expiry: 'Use any future date (e.g., 12/25)',
    cvc: 'Use any 3-digit number',
    name: 'Use any name'
  }
})