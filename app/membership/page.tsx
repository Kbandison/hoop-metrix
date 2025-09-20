'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Check, Star, Crown, Zap, Users, TrendingUp, Lock, ArrowRight, Gift, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth/auth-context'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getClientStripeConfig } from '@/lib/stripe/config'

const stripeConfig = getClientStripeConfig()
const stripePromise = loadStripe(stripeConfig.publishableKey)

interface Plan {
  id: string
  name: string
  price: number
  originalPrice?: number
  interval: 'month' | 'year'
  description: string
  features: string[]
  isPopular?: boolean
  isPremium?: boolean
  badge?: string
  color: string
  icon: React.ComponentType<any>
}

const MONTHLY_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Access',
    price: 0,
    interval: 'month',
    description: 'Basic basketball information',
    features: [
      'Basic player profiles',
      'Team information',
      'Season schedules',
      'Basic statistics',
      'Limited access to content'
    ],
    color: 'from-gray-500 to-gray-600',
    icon: Users
  },
  {
    id: 'premium',
    name: 'HoopMetrix Premium',
    price: 10.00,
    interval: 'month',
    description: 'Complete basketball database access',
    features: [
      'Full access to all player profiles',
      'Complete team information & stats',
      'Advanced statistics & analytics',
      'Player comparison tools',
      'Historical data access',
      'Premium articles & insights',
      'Ad-free experience',
      'Priority customer support',
      'Exclusive insider content',
      'Custom alerts & notifications',
      'Early access to new features'
    ],
    isPopular: true,
    badge: 'Complete Access',
    color: 'from-kentucky-blue-500 to-kentucky-blue-600',
    icon: Crown
  }
]

const YEARLY_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Access',
    price: 0,
    interval: 'year',
    description: 'Basic basketball information',
    features: [
      'Basic player profiles',
      'Team information',
      'Season schedules',
      'Basic statistics',
      'Limited access to content'
    ],
    color: 'from-gray-500 to-gray-600',
    icon: Users
  },
  {
    id: 'premium',
    name: 'HoopMetrix Premium',
    price: 100.00,
    originalPrice: 120.00,
    interval: 'year',
    description: 'Complete basketball database access',
    features: [
      'Full access to all player profiles',
      'Complete team information & stats',
      'Advanced statistics & analytics',
      'Player comparison tools',
      'Historical data access',
      'Premium articles & insights',
      'Ad-free experience',
      'Priority customer support',
      'Exclusive insider content',
      'Custom alerts & notifications',
      'Early access to new features'
    ],
    isPopular: true,
    badge: 'Save 17%',
    color: 'from-kentucky-blue-500 to-kentucky-blue-600',
    icon: Crown
  }
]

const FEATURES_COMPARISON = [
  { feature: 'Basic Player Profiles', free: true, premium: true },
  { feature: 'Basic Team Information', free: true, premium: true },
  { feature: 'Basic Statistics', free: true, premium: true },
  { feature: 'Complete Player Profiles', free: false, premium: true },
  { feature: 'Advanced Analytics', free: false, premium: true },
  { feature: 'Player Comparisons', free: false, premium: true },
  { feature: 'Historical Data', free: false, premium: true },
  { feature: 'Premium Articles', free: false, premium: true },
  { feature: 'Ad-free Experience', free: false, premium: true },
  { feature: 'Exclusive Insider Content', free: false, premium: true },
  { feature: 'Custom Alerts', free: false, premium: true },
  { feature: 'Priority Support', free: false, premium: true }
]

// Subscription Payment Form Component
function SubscriptionPaymentForm({ 
  plan, 
  billingCycle, 
  onSuccess, 
  onCancel 
}: {
  plan: Plan
  billingCycle: 'monthly' | 'yearly'
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { user, refreshUser } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [needsAccount, setNeedsAccount] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  
  // Auto-fill form data for authenticated users, empty for guests
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    password: '', // Only needed for guest signup
    confirmPassword: '' // Only needed for guest signup
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!stripe || !elements || !formData.name || !formData.email) {
      setPaymentError('Please fill in all required fields')
      return
    }

    // For guest users, validate password fields
    if (!user && (!formData.password || formData.password !== formData.confirmPassword)) {
      if (!formData.password) {
        setPaymentError('Password is required to create an account')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setPaymentError('Passwords do not match')
        return
      }
      if (formData.password.length < 6) {
        setPaymentError('Password must be at least 6 characters')
        return
      }
    }

    setIsProcessing(true)
    setPaymentError(null)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setPaymentError('Card element not found')
      setIsProcessing(false)
      return
    }

    try {
      // If user is not authenticated, create account first
      if (!user) {
        setIsCreatingAccount(true)
        const signupResponse = await fetch('/api/auth/signup-with-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.name,
            planId: plan.id,
            billingCycle
          })
        })

        const signupResult = await signupResponse.json()
        if (!signupResponse.ok) {
          // Handle specific error cases
          if (signupResponse.status === 409) {
            // Account already exists
            throw new Error(`${signupResult.error || 'Account already exists'} Would you like to sign in instead?`)
          }
          throw new Error(signupResult.error || 'Failed to create account')
        }

        // Account created successfully, continue with payment setup
        setIsCreatingAccount(false)
      }

      // Create subscription setup intent
      const setupResponse = await fetch('/api/create-subscription-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          customer_details: {
            name: formData.name,
            email: formData.email
          }
        })
      })

      if (!setupResponse.ok) {
        const errorData = await setupResponse.json()
        throw new Error(errorData.error || 'Failed to create subscription setup')
      }

      const { clientSecret, customerId, setupIntentId } = await setupResponse.json()

      // Confirm setup intent with payment method
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email
          }
        }
      })

      if (error) {
        setPaymentError(error.message || 'Payment setup failed')
        return
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        // Confirm subscription with timeout
        console.log('Calling confirm-subscription API...')
        const confirmResponse = await fetch('/api/confirm-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            setupIntentId: setupIntent.id,
            customerId,
            planId: plan.id,
            billingCycle
          })
        })

        console.log('Confirm subscription response status:', confirmResponse.status)

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json()
          console.error('Confirm subscription error:', errorData)
          throw new Error(errorData.error || 'Failed to create subscription')
        }

        const result = await confirmResponse.json()
        console.log('Confirm subscription result:', result)
        
        if (result.success) {
          console.log('Subscription confirmed successfully')
          
          // If this was a guest signup, sign them in automatically
          if (!user && formData.email && formData.password) {
            try {
              console.log('Attempting to sign in guest user...')
              const signinResponse = await fetch('/api/auth/signin-after-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: formData.email,
                  password: formData.password
                })
              })
              
              if (signinResponse.ok) {
                console.log('User signed in successfully after subscription')
                // Give a moment for auth state to update
                setTimeout(() => {
                  onSuccess()
                }, 1000)
              } else {
                console.log('Could not sign in user automatically, but subscription succeeded')
                onSuccess()
              }
            } catch (signinError) {
              console.log('Could not sign in user automatically, but subscription succeeded')
              onSuccess()
            }
          } else {
            console.log('User was already logged in, proceeding to success')
            onSuccess()
          }
        } else {
          throw new Error('Subscription confirmation failed')
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setPaymentError(error instanceof Error ? error.message : 'An error occurred')
      setIsCreatingAccount(false)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {user ? `Subscribe to ${plan.name}` : `Create Account & Subscribe`}
            </h3>
            {!user && (
              <p className="text-sm text-gray-600 mt-1">
                You'll create an account and subscribe in one step
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{plan.name}</span>
            <span className="font-bold text-gray-900">
              ${plan.price.toFixed(2)}/{plan.interval}
            </span>
          </div>
          {user && (
            <div className="mt-2 text-sm text-gray-600">
              Subscribing as: {user.email}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={user ? true : false} // Disable if user is logged in (auto-filled)
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={user ? true : false} // Disable if user is logged in (auto-filled)
              className="mt-1"
            />
          </div>

          {/* Password fields only for non-authenticated users */}
          {!user && (
            <>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="mt-1"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="mt-1"
                  placeholder="Re-enter your password"
                />
              </div>

              <div className="text-center py-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/login" 
                    className="text-kentucky-blue-600 hover:text-kentucky-blue-700 font-medium"
                  >
                    Sign in instead
                  </Link>
                </p>
              </div>
            </>
          )}

          <div>
            <Label>Card Information *</Label>
            <div className="mt-1 p-3 border rounded-md bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {stripeConfig.isSandboxMode && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 font-medium text-sm">🏖️ Test Mode</span>
                <span className="text-yellow-700 text-xs">
                  Use card: 4242 4242 4242 4242
                </span>
              </div>
            </div>
          )}

          {paymentError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{paymentError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-kentucky-blue-600 hover:bg-kentucky-blue-700"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isCreatingAccount ? 'Creating Account...' : 'Processing Payment...'}
                </div>
              ) : (
                <>
                  <Shield className="mr-2 w-4 h-4" />
                  {user ? `Subscribe ${plan.price.toFixed(2)}` : `Create Account & Subscribe ${plan.price.toFixed(2)}`}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, type: "spring" as const, stiffness: 100 }
  },
  hover: {
    y: -10,
    scale: 1.02,
    transition: { duration: 0.3 }
  }
}

function MembershipPageContent() {
  const { user, loading, refreshUser } = useAuth()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const currentPlans = billingCycle === 'monthly' ? MONTHLY_PLANS : YEARLY_PLANS

  const handlePlanSelect = (planId: string) => {
    if (planId === 'free') {
      // Handle free plan signup - redirect to registration if not logged in
      if (!user) {
        window.location.href = '/auth/signup'
      } else {
        // User is already logged in with free plan
        alert('You already have free access!')
      }
      return
    }

    setSelectedPlan(planId)
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = () => {
    // Database is now updated correctly, redirect immediately
    window.location.href = '/membership/success'
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
  }

  const selectedPlanData = currentPlans.find(plan => plan.id === selectedPlan)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-kentucky-blue-500/20 to-purple-500/20"
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" as const }}
            >
              <Badge className="bg-gradient-to-r from-kentucky-blue-500 to-purple-500 text-white px-6 py-2 text-sm font-semibold">
                🏀 UNLOCK YOUR POTENTIAL
              </Badge>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
              <span className="bg-gradient-to-r from-kentucky-blue-400 to-purple-400 bg-clip-text text-transparent">
                Level Up
              </span>
              <br />
              <span className="text-white">Your Game Knowledge</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Get exclusive access to advanced analytics, insider content, and premium features
            </p>

            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-kentucky-blue-400">10K+</div>
                <div className="text-gray-400 text-sm">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">50M+</div>
                <div className="text-gray-400 text-sm">Data Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">24/7</div>
                <div className="text-gray-400 text-sm">Live Updates</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Start free, upgrade when you're ready for more
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <motion.button
                className="relative w-16 h-8 bg-gray-600 rounded-full p-1 cursor-pointer"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-6 h-6 bg-white rounded-full shadow-lg"
                  animate={{
                    x: billingCycle === 'yearly' ? 32 : 0
                  }}
                  transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                />
              </motion.button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
                Yearly
              </span>
              <div className="ml-2 w-20 h-6 flex items-center justify-center">
                <AnimatePresence>
                  {billingCycle === 'yearly' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge className="bg-green-500 text-white">Save 17%</Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {currentPlans.map((plan, index) => {
              const IconComponent = plan.icon
              return (
                <motion.div
                  key={plan.id}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`relative ${plan.isPopular ? 'lg:-mt-4 lg:mb-4' : ''}`}
                >
                  <Card className={`relative overflow-hidden border-2 ${
                    plan.isPopular 
                      ? 'border-kentucky-blue-500 shadow-2xl shadow-kentucky-blue-500/20' 
                      : 'border-gray-600'
                  } bg-slate-800/50 backdrop-blur-sm`}>
                    {/* Popular Badge */}
                    {plan.isPopular && (
                      <div className="absolute top-0 left-0 right-0">
                        <div className={`bg-gradient-to-r ${plan.color} text-white text-center py-2 text-sm font-semibold`}>
                          {plan.badge}
                        </div>
                      </div>
                    )}

                    <CardHeader className={`text-center ${plan.isPopular ? 'pt-12' : 'pt-6'}`}>
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                      <p className="text-gray-400">{plan.description}</p>
                      
                      <div className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-black text-white">
                            ${plan.price}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-gray-400">/{plan.interval}</span>
                          )}
                        </div>
                        {plan.originalPrice && (
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-gray-700 line-through text-sm">
                              ${plan.originalPrice}
                            </span>
                            <Badge className="bg-green-500 text-white text-xs">
                              Save ${(plan.originalPrice - plan.price).toFixed(0)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <Button
                        onClick={() => handlePlanSelect(plan.id)}
                        className={`w-full py-3 font-semibold transition-all duration-300 ${
                          plan.id === 'free'
                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                            : `bg-gradient-to-r ${plan.color} hover:shadow-lg hover:shadow-current/25 text-white`
                        }`}
                        size="lg"
                      >
{plan.id === 'free' ? 'Get Started' : 'Subscribe Now'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      <div className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + featureIndex * 0.1 }}
                          >
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center flex-shrink-0`}>
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Compare Features
            </h2>
            <p className="text-gray-300 text-lg">
              See what's included in each plan
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="bg-slate-800/50 border-gray-600 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left p-6 text-white font-semibold">Features</th>
                      <th className="text-center p-6 text-white font-semibold">Free</th>
                      <th className="text-center p-6 text-white font-semibold">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURES_COMPARISON.map((item, index) => (
                      <motion.tr
                        key={index}
                        className="border-b border-gray-700/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                      >
                        <td className="p-6 text-gray-200">{item.feature}</td>
                        <td className="p-6 text-center">
                          {item.free ? (
                            <Check className="w-5 h-5 text-green-400 mx-auto" />
                          ) : (
                            <div className="w-5 h-5 mx-auto bg-gray-600 rounded-full" />
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {item.premium ? (
                            <Check className="w-5 h-5 text-kentucky-blue-400 mx-auto" />
                          ) : (
                            <div className="w-5 h-5 mx-auto bg-gray-600 rounded-full" />
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period."
              },
              {
                question: "Is there a free trial for paid plans?",
                answer: "Yes! Both Pro Stats and Elite Insider plans come with a 14-day free trial. No credit card required to start."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and digital wallets like Apple Pay and Google Pay."
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer: "Absolutely! You can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-gray-600">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-kentucky-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Elevate Your Game?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of basketball fans who trust HoopMetrix for the most comprehensive basketball analytics and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-kentucky-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
                onClick={() => handlePlanSelect('premium')}
              >
                Subscribe Now
                <Zap className="w-5 h-5 ml-2" />
              </Button>
              <Link href="/shop">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-kentucky-blue-600 font-semibold px-8 py-3"
                >
                  Browse Merchandise
                  <Gift className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedPlanData && (
        <SubscriptionPaymentForm
          plan={selectedPlanData}
          billingCycle={billingCycle}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  )
}

export default function MembershipPage() {
  return (
    <Elements stripe={stripePromise}>
      <MembershipPageContent />
    </Elements>
  )
}