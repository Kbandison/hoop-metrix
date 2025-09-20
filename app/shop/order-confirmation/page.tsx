'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  category: string
}

interface OrderDetails {
  orderId: string
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered'
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  orderDate: string
  estimatedDelivery: string
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch order details using payment intent ID or session ID
  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent')
    const sessionId = searchParams.get('session_id')
    
    console.log('=== ORDER CONFIRMATION DEBUG ===')
    console.log('Current URL:', window.location.href)
    console.log('Search params:', searchParams.toString())
    console.log('Payment intent from URL:', paymentIntent)
    console.log('Session ID from URL:', sessionId)
    console.log('================================')
    
    if (paymentIntent) {
      // Direct payment intent - ensure order exists first, then fetch it
      setLoading(true)
      console.log(`Ensuring order exists for payment intent: ${paymentIntent}`)
      
      // Check if this is a free order
      if (paymentIntent.startsWith('free_order_')) {
        console.log('Detected free order, using free order API')
        fetch(`/api/order/free/${paymentIntent}`)
          .then(response => response.json())
          .then(data => {
            if (data.success && data.order) {
              console.log('Free order retrieved successfully:', data.order)
              setOrder(data.order)
            } else {
              console.error('Failed to retrieve free order:', data.error)
              setError('Unable to retrieve order details')
            }
            setLoading(false)
          })
          .catch(error => {
            console.error('Error fetching free order:', error)
            setError('Unable to retrieve order details')
            setLoading(false)
          })
        return
      }
      
      // For regular Stripe payments - try to create/ensure the order exists
      fetch('/api/order/create-from-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_intent_id: paymentIntent })
      })
      .then(res => res.json())
      .then(createData => {
        console.log('Order Confirmation - Create order response:', createData)
        
        // Now fetch the order details regardless of create result
        return fetch(`/api/order/${paymentIntent}`)
      })
      .then(res => {
        console.log('Order Confirmation - Fetch order response status:', res.status)
        return res.json()
      })
      .then(data => {
        console.log('Order Confirmation - Order data:', data)
        if (data.success && data.order) {
          console.log('Order Confirmation - SUCCESS! Setting real order data:', data.order.orderId)
          setOrder(data.order)
          setError(null)
        } else {
          console.error('Order Confirmation - Failed to load order:', data.error)
          setError(`Order not found: ${data.details || data.error}`)
          setOrder(null)
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Order Confirmation - Error in order processing:', error.message)
        setError(`Order processing error: ${error.message}`)
        setOrder(null)
        setLoading(false)
      })
    } else if (sessionId) {
      // We have session ID - need to get payment intent from Stripe session first
      setLoading(true)
      console.log(`Getting payment intent from session: ${sessionId}`)
      
      fetch(`/api/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.payment_intent) {
            console.log('Session resolved to payment intent:', data.payment_intent)
            
            // First ensure the order exists for this payment intent
            return fetch('/api/order/create-from-payment-intent', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ payment_intent_id: data.payment_intent })
            })
            .then(res => res.json())
            .then(createData => {
              console.log('Order Confirmation - Create order response:', createData)
              // Now fetch the order using the payment intent
              return fetch(`/api/order/${data.payment_intent}`)
            })
          } else {
            throw new Error(data.error || 'Failed to resolve session')
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.order) {
            console.log('Order Confirmation - SUCCESS! Setting real order data:', data.order.orderId)
            setOrder(data.order)
            setError(null)
          } else {
            console.error('Order Confirmation - Failed to load order:', data.error)
            setError(`Order not found: ${data.details || data.error}`)
            setOrder(null)
          }
          setLoading(false)
        })
        .catch(error => {
          console.error('Order Confirmation - Error processing session:', error.message)
          setError(`Session processing error: ${error.message}`)
          setOrder(null)
          setLoading(false)
        })
    } else {
      console.error('Order Confirmation - No payment intent or session ID found in URL')
      setError('No payment intent or session ID provided in URL')
      setOrder(null)
      setLoading(false)
    }
  }, [searchParams])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kentucky-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 mb-6 inline-block">
                <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Order Not Found
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                We couldn't find your order details.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <p className="text-red-700 text-sm font-mono break-all">
                  {error || 'Unknown error occurred'}
                </p>
                {searchParams.get('payment_intent') && (
                  <p className="text-red-700 text-sm mt-2">
                    <span className="font-semibold text-red-800">Payment Intent:</span> {searchParams.get('payment_intent')}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  This could happen if:
                </p>
                <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
                  <li>• The order hasn't been processed yet</li>
                  <li>• There was an issue with payment processing</li>
                  <li>• The order link is invalid or expired</li>
                </ul>
              </div>
              
              <div className="mt-8 space-x-4">
                <Link href="/shop">
                  <Button className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800">
                    Back to Shop
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="outline">
                    View My Account
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-gray-500 mt-8">
                If you need help, please contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24">
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Success Header */}
            <motion.div variants={itemVariants} className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" as const, stiffness: 200 }}
                className="inline-block mb-6"
              >
                <div className="bg-green-100 rounded-full p-4 mb-4">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </motion.div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Order Confirmed!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Thank you for your purchase, {order.customerInfo.name}
              </p>
              <p className="text-gray-500">
                Placed on {order.orderDate}
              </p>
            </motion.div>

            {/* Order Status */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Package className="w-5 h-5" />
                      Order Status
                    </CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Order Placed</p>
                        <p className="text-sm text-gray-800">{order.orderDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Package className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Processing</p>
                        <p className="text-sm text-gray-800">1-2 business days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Truck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Estimated Delivery</p>
                        <p className="text-sm text-gray-800">{order.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Items */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <ShoppingBag className="w-5 h-5" />
                    Order Items ({order.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-700">{item.category}</p>
                          <p className="text-sm text-gray-800">Qty: {item.quantity}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-700">
                              ${item.price.toFixed(2)} each
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gray-900">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-800">Subtotal</span>
                      <span className="font-medium text-gray-900">${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Shipping</span>
                      <span className="font-medium text-gray-900">${order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Tax</span>
                      <span className="font-medium text-gray-900">${order.tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${order.total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Shipping & Payment Info */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gray-900">Shipping & Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-800">{order.customerInfo.name}</p>
                        <p className="text-gray-800">{order.shippingAddress.street}</p>
                        <p className="text-gray-800">
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p className="text-gray-800">{order.shippingAddress.country}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                      <p className="text-gray-800 text-sm">Card ending in {order.paymentMethod}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-800">{order.customerInfo.email}</p>
                        <p className="text-gray-800">{order.customerInfo.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Actions */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center">
              {/* <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {isShared ? 'Shared!' : 'Share Order'}
              </Button> */}
              
              <Link href="/shop">
                <Button className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800">
                  Continue Shopping
                </Button>
              </Link>
            </motion.div>

            {/* Back to Home */}
            <motion.div variants={itemVariants} className="text-center pt-8">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-kentucky-blue-600 hover:text-kentucky-blue-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kentucky-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    </div>}>
      <OrderConfirmationContent />
    </Suspense>
  )
}