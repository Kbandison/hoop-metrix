'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Navigation from '@/components/layout/navigation'
import { useCart, createCartItemKey } from '@/lib/contexts/cart-context'

export default function CartPage() {
  const { items, totalItems, totalAmount, updateQuantity, removeItem, clearCart } = useCart()

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const shippingCost = totalAmount >= 75 ? 0 : 9.99
  const tax = totalAmount * 0.08 // 8% tax
  const finalTotal = totalAmount + shippingCost + tax

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/shop">
            <Button variant="ghost" className="text-kentucky-blue-600 hover:bg-kentucky-blue-50 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        {items.length === 0 ? (
          // Empty Cart
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Your cart is empty</h2>
            <p className="text-gray-700 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700">
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          // Cart with Items
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Cart Items</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => {
                    const itemKey = createCartItemKey(item)
                    return (
                      <motion.div
                        key={itemKey}
                        className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        layout
                      >
                        {/* Product Image */}
                        <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src="/placeholder-product.jpg"
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                            {item.name}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            {item.selectedSize && (
                              <Badge variant="outline" className="text-xs">
                                Size: {item.selectedSize}
                              </Badge>
                            )}
                            {item.selectedColor && (
                              <Badge variant="outline" className="text-xs">
                                Color: {item.selectedColor}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-gray-900">
                                ${item.price.toFixed(2)}
                              </span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-700 line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => handleQuantityChange(itemKey, item.quantity - 1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="font-medium text-lg min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => handleQuantityChange(itemKey, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeItem(itemKey)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2 text-right">
                            <span className="text-sm font-medium text-gray-700">
                              Subtotal: ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-32">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-900 [&_label]:text-gray-900 [&_label]:font-medium [&_input]:bg-white [&_input]:text-gray-900 [&_button]:text-gray-900">
                  {/* Promo Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <Input placeholder="Enter code" />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </div>

                  {/* Order Breakdown */}
                  <div className="space-y-3 py-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-900">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-900">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          `$${shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-900">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    
                    {totalAmount < 75 && (
                      <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                        Add ${(75 - totalAmount).toFixed(2)} more for free shipping!
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-200 text-gray-900">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>

                  {/* Checkout Button */}
                  <Link href="/shop/checkout" className="block">
                    <Button size="lg" className="w-full bg-kentucky-blue-600 hover:bg-kentucky-blue-700">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>

                  {/* Security Features */}
                  <div className="text-center pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-700 space-y-1">
                      <div>🔒 Secure checkout with SSL encryption</div>
                      <div>📦 Free returns within 30 days</div>
                      <div>🏆 100% authentic products</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}