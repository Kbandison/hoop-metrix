'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Share2, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import Navigation from '@/components/layout/navigation'
import { useCart } from '@/lib/contexts/cart-context'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  team?: string
  league?: string
  images: string[]
  inStock: boolean
  rating: number
  reviewCount: number
  sizes?: string[]
  colors?: string[]
  featured: boolean
  longDescription: string
  specifications: Record<string, string>
  shippingInfo: string
}

interface Review {
  id: string
  user: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

const MOCK_PRODUCT: Product = {
  id: '1',
  name: 'Lakers #23 LeBron James Jersey',
  description: 'Official NBA Swingman Jersey featuring LeBron James',
  longDescription: 'Experience the pinnacle of basketball fashion with this authentic NBA Swingman Jersey featuring LeBron James. Crafted with premium materials and official team colors, this jersey represents the perfect blend of style, comfort, and team pride. Whether you\'re at the game or watching from home, show your support for one of the greatest players of all time.',
  price: 119.99,
  originalPrice: 139.99,
  category: 'Jerseys',
  team: 'Lakers',
  league: 'NBA',
  images: [
    '/placeholder-jersey-1.jpg',
    '/placeholder-jersey-2.jpg',
    '/placeholder-jersey-3.jpg',
    '/placeholder-jersey-4.jpg'
  ],
  inStock: true,
  rating: 4.8,
  reviewCount: 234,
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Purple', 'Gold', 'White'],
  featured: true,
  specifications: {
    'Brand': 'Nike',
    'Material': '100% Polyester',
    'Fit': 'Swingman',
    'Care': 'Machine Wash Cold',
    'Country': 'Made in Thailand',
    'Style': 'Replica Jersey'
  },
  shippingInfo: 'Free shipping on orders over $75. Standard delivery 3-5 business days.'
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    user: 'Mike Johnson',
    rating: 5,
    comment: 'Amazing quality jersey! The fit is perfect and the colors are vibrant. Definitely worth the money.',
    date: '2024-01-15',
    verified: true
  },
  {
    id: '2',
    user: 'Sarah Davis',
    rating: 4,
    comment: 'Great jersey, but sizing runs a bit large. Order one size down from your usual.',
    date: '2024-01-10',
    verified: true
  },
  {
    id: '3',
    user: 'Alex Thompson',
    rating: 5,
    comment: 'Fast shipping and excellent quality. My son loves wearing this to Lakers games!',
    date: '2024-01-08',
    verified: false
  }
]

const RELATED_PRODUCTS = [
  {
    id: '2',
    name: 'Lakers #8 Kobe Bryant Jersey',
    price: 129.99,
    image: '/placeholder-kobe-jersey.jpg',
    rating: 4.9
  },
  {
    id: '3',
    name: 'Lakers Championship Hat',
    price: 34.99,
    image: '/placeholder-lakers-hat.jpg',
    rating: 4.6
  },
  {
    id: '4',
    name: 'Lakers Team Hoodie',
    price: 79.99,
    image: '/placeholder-lakers-hoodie.jpg',
    rating: 4.7
  }
]

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem, openCart } = useCart()

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProduct(MOCK_PRODUCT)
      setReviews(MOCK_REVIEWS)
      setLoading(false)
    }, 1000)
  }, [resolvedParams.id])

  const addToCart = () => {
    if (!product) return
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: '/placeholder-product.jpg',
      category: product.category,
      selectedSize,
      selectedColor,
      inStock: product.inStock,
      quantity
    })
    openCart()
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // This will integrate with wishlist context later
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <Skeleton className="h-96 w-full mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-32 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-32">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/shop">
            <Button variant="ghost" className="text-kentucky-blue-600 hover:bg-kentucky-blue-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Main Image */}
            <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-4">
              <Image
                src="/placeholder-product.jpg"
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              
              {/* Sale Badge */}
              {product.originalPrice && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 bg-gray-200 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-kentucky-blue-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src="/placeholder-product.jpg"
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Product Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                {product.league && (
                  <Badge 
                    className={`${
                      product.league === 'NBA' 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-purple-500 hover:bg-purple-600'
                    } text-white`}
                  >
                    {product.league}
                  </Badge>
                )}
                {product.featured && (
                  <Badge className="bg-kentucky-blue-600 text-white">
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-700 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <Badge className="bg-red-500 text-white">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              {/* Size Selection */}
              {product.sizes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map(color => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-medium text-lg min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-kentucky-blue-600 hover:bg-kentucky-blue-700"
                onClick={addToCart}
                disabled={!product.inStock || (product.sizes && !selectedSize) || (product.colors && !selectedColor)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={toggleWishlist}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Stock Status */}
            <div>
              {product.inStock ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">In Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Authentic Product</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {product.longDescription}
                  </p>
                  <p className="text-sm text-gray-600">
                    {product.shippingInfo}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-700">{key}</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.user}</span>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{review.date}</span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RELATED_PRODUCTS.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/shop/products/${relatedProduct.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <Image
                        src="/placeholder-product.jpg"
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">${relatedProduct.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{relatedProduct.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}