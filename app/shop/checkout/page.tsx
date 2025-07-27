'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Truck, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import Navigation from '@/components/layout/navigation'
import { useCart, createCartItemKey } from '@/lib/contexts/cart-context'

interface FormData {
  email: string
  firstName: string
  lastName: string
  company: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  shippingMethod: string
  paymentMethod: string
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
  billingAddressSame: boolean
  billingAddress1: string
  billingCity: string
  billingState: string
  billingZipCode: string
  saveInfo: boolean
  newsletter: boolean
}

const initialFormData: FormData = {
  email: '',
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  phone: '',
  shippingMethod: 'standard',
  paymentMethod: 'card',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  nameOnCard: '',
  billingAddressSame: true,
  billingAddress1: '',
  billingCity: '',
  billingState: '',
  billingZipCode: '',
  saveInfo: false,
  newsletter: false
}

const shippingMethods = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    price: 0,
    freeThreshold: 75
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    price: 15.99,
    freeThreshold: null
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day',
    price: 29.99,
    freeThreshold: null
  }
]

export default function CheckoutPage() {
  const { items, totalItems, totalAmount, clearCart } = useCart()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate shipping cost
  const selectedShipping = shippingMethods.find(method => method.id === formData.shippingMethod)
  const shippingCost = selectedShipping ? 
    (selectedShipping.freeThreshold && totalAmount >= selectedShipping.freeThreshold ? 0 : selectedShipping.price) 
    : 0

  const tax = totalAmount * 0.08 // 8% tax
  const finalTotal = totalAmount + shippingCost + tax

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Required fields
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.address1) newErrors.address1 = 'Address is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'

    // Payment validation
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required'
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required'
      if (!formData.cvv) newErrors.cvv = 'CVV is required'
      if (!formData.nameOnCard) newErrors.nameOnCard = 'Name on card is required'
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      // TODO: Implement order submission to database
      // Clear cart and redirect to success page
      clearCart()
      window.location.href = '/shop/order-confirmation'
    }, 2000)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-32 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <Link href="/shop">
            <Button className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

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
          <Link href="/shop/cart">
            <Button variant="ghost" className="text-kentucky-blue-600 hover:bg-kentucky-blue-50 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your order for {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="[&_label]:text-gray-900 [&_label]:font-medium [&_input]:bg-white [&_input]:text-gray-900 [&_button]:text-gray-900 [&_select]:bg-white [&_select]:text-gray-900">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6 text-gray-900">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-kentucky-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-900">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange('newsletter', checked as boolean)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for updates and offers
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-kentucky-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-900">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address1">Address *</Label>
                    <Input
                      id="address1"
                      value={formData.address1}
                      onChange={(e) => handleInputChange('address1', e.target.value)}
                      className={errors.address1 ? 'border-red-500' : ''}
                    />
                    {errors.address1 && <p className="text-red-500 text-sm mt-1">{errors.address1}</p>}
                  </div>

                  <div>
                    <Label htmlFor="address2">Apartment, suite, etc. (Optional)</Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => handleInputChange('address2', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                        <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          {/* Add more states as needed */}
                        </SelectContent>
                      </Select>
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={errors.zipCode ? 'border-red-500' : ''}
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-kentucky-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={formData.shippingMethod} 
                    onValueChange={(value) => handleInputChange('shippingMethod', value)}
                  >
                    {shippingMethods.map((method) => {
                      const isFree = method.freeThreshold && totalAmount >= method.freeThreshold
                      const displayPrice = isFree ? 0 : method.price
                      
                      return (
                        <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor={method.id} className="font-medium cursor-pointer">
                                  {method.name}
                                </Label>
                                <p className="text-sm text-gray-600">{method.description}</p>
                              </div>
                              <div className="text-right">
                                {displayPrice === 0 ? (
                                  <span className="font-medium text-green-600">FREE</span>
                                ) : (
                                  <span className="font-medium">${displayPrice.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-kentucky-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-900">
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="w-4 h-4" />
                        Credit Card
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          className={errors.cardNumber ? 'border-red-500' : ''}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            className={errors.expiryDate ? 'border-red-500' : ''}
                          />
                          {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            className={errors.cvv ? 'border-red-500' : ''}
                          />
                          {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="nameOnCard">Name on Card *</Label>
                        <Input
                          id="nameOnCard"
                          value={formData.nameOnCard}
                          onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                          className={errors.nameOnCard ? 'border-red-500' : ''}
                        />
                        {errors.nameOnCard && <p className="text-red-500 text-sm mt-1">{errors.nameOnCard}</p>}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="saveInfo"
                      checked={formData.saveInfo}
                      onCheckedChange={(checked) => handleInputChange('saveInfo', checked as boolean)}
                    />
                    <Label htmlFor="saveInfo" className="text-sm">
                      Save my information for faster checkout next time
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-32">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-900">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                      const itemKey = createCartItemKey(item)
                      return (
                        <div key={itemKey} className="flex items-center gap-3 p-2 border rounded">
                          <div className="relative w-12 h-12 bg-gray-200 rounded overflow-hidden">
                            <Image
                              src="/placeholder-product.jpg"
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-700">
                              <span>Qty: {item.quantity}</span>
                              {item.selectedSize && <span>• {item.selectedSize}</span>}
                              {item.selectedColor && <span>• {item.selectedColor}</span>}
                            </div>
                          </div>
                          <div className="font-medium text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Order Breakdown */}
                  <div className="space-y-2 py-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          `$${shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold pt-4 border-t">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-kentucky-blue-600 hover:bg-kentucky-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Shield className="mr-2 w-4 h-4" />
                        Place Order
                      </>
                    )}
                  </Button>

                  {/* Security Info */}
                  <div className="text-center pt-4 border-t">
                    <div className="text-xs text-gray-700 space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Secure checkout with SSL encryption</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>Free returns within 30 days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  )
}