'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, Calendar, Download, Share2, ArrowLeft, ShoppingBag } from 'lucide-react'
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

// Mock order data - in real app this would come from API/database
const MOCK_ORDER: OrderDetails = {
  orderId: 'HM-2024-001234',
  status: 'confirmed',
  items: [
    {
      id: '1',
      name: 'Lakers #23 LeBron James Jersey',
      price: 119.99,
      quantity: 1,
      image: '/placeholder-jersey.jpg',
      category: 'Jerseys'
    },
    {
      id: '2',
      name: 'NBA Logo Hoodie',
      price: 69.99,
      quantity: 2,
      image: '/placeholder-hoodie.jpg',
      category: 'Apparel'
    }
  ],
  subtotal: 259.97,
  shipping: 9.99,
  tax: 23.40,
  total: 293.36,
  customerInfo: {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567'
  },
  shippingAddress: {
    street: '123 Basketball Lane',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'United States'
  },
  paymentMethod: '**** **** **** 1234',
  orderDate: new Date().toLocaleDateString(),
  estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
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
  const [order, setOrder] = useState<OrderDetails>(MOCK_ORDER)
  const [isShared, setIsShared] = useState(false)

  // In real app, fetch order details using order ID from searchParams
  useEffect(() => {
    const orderId = searchParams.get('order')
    if (orderId) {
      // Fetch order details from API
      // TODO: Implement order fetching from database
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HoopMetrix Order Confirmation',
          text: `Order ${order.orderId} confirmed! Total: $${order.total}`,
          url: window.location.href
        })
        setIsShared(true)
      } catch (error) {
        // Error in sharing functionality
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      setIsShared(true)
      setTimeout(() => setIsShared(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      
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
                Order #{order.orderId} • Placed on {order.orderDate}
              </p>
            </motion.div>

            {/* Order Status */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
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
                        <p className="text-sm text-gray-500">{order.orderDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Package className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Processing</p>
                        <p className="text-sm text-gray-500">1-2 business days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Truck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Estimated Delivery</p>
                        <p className="text-sm text-gray-500">{order.estimatedDelivery}</p>
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
                  <CardTitle className="flex items-center gap-2">
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
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-500">
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
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">${order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${order.tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Shipping & Payment Info */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping & Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p>{order.customerInfo.name}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                      <p className="text-gray-600 text-sm">Card ending in {order.paymentMethod}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p>{order.customerInfo.email}</p>
                        <p>{order.customerInfo.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Actions */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {isShared ? 'Shared!' : 'Share Order'}
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Invoice
              </Button>
              
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