'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCart, createCartItemKey } from '@/lib/contexts/cart-context'

const sidebarVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' }
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

export default function CartSidebar() {
  const { isOpen, items, totalItems, totalAmount, closeCart, updateQuantity, removeItem } = useCart()

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    console.log('Cart Sidebar - handleRemoveItem called with itemId:', itemId)
    console.log('Cart Sidebar - About to call removeItem from context')
    removeItem(itemId)
    console.log('Cart Sidebar - removeItem call completed')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCart}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-900" />
                <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                {totalItems > 0 && (
                  <Badge className="bg-kentucky-blue-600 text-white">
                    {totalItems}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={closeCart}>
                <X className="w-5 h-5 text-gray-900" />
              </Button>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 p-6">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 mb-6">Add some items to get started!</p>
                    <Button onClick={closeCart} className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700">
                      Continue Shopping
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const itemKey = createCartItemKey(item)
                      console.log('Cart Sidebar - Rendering item:', item.name, 'with itemKey:', itemKey)
                      return (
                        <motion.div
                          key={itemKey}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                        >
                          {/* Product Image */}
                          <div className="relative w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-xs font-medium">No Image</div>'
                                  }
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-500 text-xs font-medium">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                              {item.name}
                            </h4>
                            
                            {/* Variants */}
                            <div className="flex items-center gap-2 mb-2">
                              {item.selectedSize && (
                                <Badge variant="outline" className="text-xs">
                                  {item.selectedSize}
                                </Badge>
                              )}
                              {item.selectedColor && (
                                <Badge variant="outline" className="text-xs">
                                  {item.selectedColor}
                                </Badge>
                              )}
                            </div>

                            {/* Price and Quantity */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-600">
                                  ({item.quantity}x ${item.price.toFixed(2)})
                                </span>
                                {item.originalPrice && (
                                  <span className="text-xs text-gray-500 line-through">
                                    ${item.originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  console.log('Cart Sidebar - Delete button clicked for itemKey:', itemKey)
                                  console.log('Cart Sidebar - Item details:', item.name, item.id, item.selectedSize, item.selectedColor)
                                  handleRemoveItem(itemKey)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-gray-600">Quantity:</span>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-7 h-7 p-0 text-gray-700 border-gray-300"
                                  onClick={() => handleQuantityChange(itemKey, item.quantity - 1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="font-medium text-sm min-w-[1.5rem] text-center text-gray-900">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-7 h-7 p-0 text-gray-700 border-gray-300"
                                  onClick={() => handleQuantityChange(itemKey, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4 bg-white text-gray-900">
                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total ({totalItems} items):</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link href="/shop/cart" className="block" onClick={closeCart}>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/shop/checkout" className="block" onClick={closeCart}>
                    <Button className="w-full bg-kentucky-blue-600 hover:bg-kentucky-blue-700 text-white">
                      Checkout
                    </Button>
                  </Link>
                </div>

                {/* Continue Shopping */}
                <Button
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-800"
                  onClick={closeCart}
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}