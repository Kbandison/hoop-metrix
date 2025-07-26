'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, ShoppingCart, Star, Heart, Grid, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import Navigation from '@/components/layout/navigation'
import Footer from '@/components/layout/footer'
import { useCart } from '@/lib/contexts/cart-context'
import { Product, ProductFilter, ProductSort, PRODUCT_CATEGORIES } from '@/lib/types/product'
import { ProductsService } from '@/lib/services/products'


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
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -10,
    scale: 1.02,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10
    }
  }
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [league, setLeague] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [wishlist, setWishlist] = useState<string[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const categories = ['All', ...Object.keys(PRODUCT_CATEGORIES)]
  const leagues = ['All', 'NBA', 'WNBA']
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' }
  ]

  // Fetch products based on current filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      
      const filter: ProductFilter = {}
      if (category && category !== 'All') filter.category = category
      if (league && league !== 'All') filter.league = league
      if (search) filter.search = search
      
      const sort: ProductSort = (() => {
        switch (sortBy) {
          case 'price-low': return { field: 'price', direction: 'asc' }
          case 'price-high': return { field: 'price', direction: 'desc' }
          case 'rating': return { field: 'rating', direction: 'desc' }
          case 'newest': return { field: 'created_at', direction: 'desc' }
          default: return { field: 'name', direction: 'asc' }
        }
      })()
      
      try {
        const { products: fetchedProducts, total } = await ProductsService.getProducts(
          filter, 
          sort, 
          currentPage, 
          20
        )
        setProducts(fetchedProducts)
        setTotalProducts(total)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setTotalProducts(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [search, category, league, sortBy, currentPage])

  const filteredProducts = products

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const { addItem, openCart } = useCart()

  const addToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: product.image_url,
      category: product.category,
      inStock: product.stock_quantity > 0,
      quantity: 1
    })
    openCart()
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Header Section - Modern E-commerce Style */}
      <motion.section 
        className="relative min-h-[50vh] bg-gradient-to-br from-brand-black-900 via-brand-black-800 to-brand-grey-900 overflow-hidden pt-32"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-brand-grey-800/30 to-brand-black-700/30"
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              rotate: [0, 1, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" as const, stiffness: 100 }}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <span className="text-sm font-semibold tracking-wider">🏀 OFFICIAL MERCHANDISE</span>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <span className="block bg-gradient-to-r from-white to-brand-grey-300 bg-clip-text text-transparent">
                GEAR UP
              </span>
              <span className="block text-white text-4xl md:text-5xl font-bold mt-2">
                Like the Pros
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/90 mb-8 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Authentic NBA & WNBA merchandise • Exclusive drops • Champion gear
            </motion.p>
            
            {/* Animated Feature Pills */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              {[
                { icon: "🚚", text: "Free Shipping $75+", delay: 0 },
                { icon: "⚡", text: "Express Delivery", delay: 0.1 },
                { icon: "🔥", text: "Exclusive Items", delay: 0.2 },
                { icon: "💎", text: "100% Authentic", delay: 0.3 }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white/15 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 hover:bg-white/25 transition-all duration-300"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 + feature.delay, duration: 0.5, type: "spring" as const }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <span className="text-white font-semibold text-sm">
                    {feature.icon} {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-brand-grey-600/20 rounded-full blur-xl"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-brand-black-600/20 rounded-full blur-xl"
          animate={{ 
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </motion.section>

      {/* Filters Section - Modern E-commerce Style */}
      <motion.section 
        className="py-6 bg-gradient-to-r from-gray-50 to-white shadow-lg"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {/* Filter Header */}
            <motion.div 
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-brand-black-700 to-brand-grey-600 p-2 rounded-xl">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Find Your Perfect Gear</h3>
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔥
                </motion.div>
                <span className="font-medium">{filteredProducts.length} items available</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* Search */}
              <motion.div 
                className="lg:col-span-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-grey-600 w-5 h-5" />
                  <Input
                    placeholder="Search jerseys, shoes, accessories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-brand-grey-600 rounded-xl font-medium"
                  />
                </div>
              </motion.div>

              {/* Category Filter */}
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <Select value={category || 'All'} onValueChange={(value) => setCategory(value === 'All' ? '' : value)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-brand-grey-600 rounded-xl font-medium">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* League Filter */}
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">League</label>
                <Select value={league || 'All'} onValueChange={(value) => setLeague(value === 'All' ? '' : value)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-brand-grey-600 rounded-xl font-medium">
                    <SelectValue placeholder="All Leagues" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.map(l => (
                      <SelectItem key={l} value={l} className="font-medium">
                        <div className="flex items-center gap-2">
                          {l === 'NBA' && <span className="text-blue-600">🏀</span>}
                          {l === 'WNBA' && <span className="text-orange-600">🏀</span>}
                          {l === 'All' && <span>🏆</span>}
                          {l}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Sort */}
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-brand-grey-600 rounded-xl font-medium">
                    <SelectValue placeholder="Sort Products" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="font-medium">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* View Toggle */}
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">View</label>
                <div className="bg-gray-100 p-1 rounded-xl flex">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 rounded-lg font-semibold transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-brand-black-700 to-brand-grey-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`flex-1 rounded-lg font-semibold transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-brand-black-700 to-brand-grey-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <List className="w-4 h-4 mr-1" />
                    List
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Products Grid */}
      <section id="products" className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M20%2020h20v20H20zM0%200h20v20H0z%22/%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-black text-white mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <span className="bg-gradient-to-r from-brand-grey-400 to-brand-grey-300 bg-clip-text text-transparent">
                HOTTEST
              </span>{" "}
              <span className="text-white">DROPS</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              Discover the latest gear from your favorite teams and players
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-8`}
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
                    <Skeleton className="w-full h-80 bg-white/20" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-6 w-3/4 bg-white/20" />
                      <Skeleton className="h-4 w-1/2 bg-white/20" />
                      <Skeleton className="h-8 w-full bg-white/20" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-8`}
                key="products"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                    whileHover="hover"
                    className="group"
                  >
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 transition-all duration-500 hover:border-brand-grey-500/50 hover:shadow-2xl hover:shadow-brand-grey-500/20 cursor-pointer">
                      {/* Product Image */}
                      <div className="relative h-80 bg-gradient-to-br from-brand-black-700/20 to-brand-grey-700/20 overflow-hidden">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg'
                          }}
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Wishlist Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white"
                          onClick={(e) => {
                            e.preventDefault()
                            toggleWishlist(product.id)
                          }}
                        >
                          <Heart 
                            className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                          />
                        </Button>

                        {/* Sale Badge */}
                        {product.original_price && (
                          <motion.div
                            className="absolute top-4 left-4"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" as const }}
                          >
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1 shadow-lg">
                              🔥 SALE
                            </Badge>
                          </motion.div>
                        )}

                        {/* Featured Badge */}
                        {product.featured && (
                          <motion.div
                            className="absolute bottom-4 left-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" as const }}
                          >
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-3 py-1 shadow-lg">
                              ⭐ HOT
                            </Badge>
                          </motion.div>
                        )}

                        {/* Quick Add to Cart (appears on hover) */}
                        <motion.div
                          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-brand-black-700 to-brand-grey-600 hover:from-brand-black-800 hover:to-brand-grey-700 text-white font-bold shadow-lg"
                            onClick={() => addToCart(product)}
                            disabled={product.stock_quantity <= 0}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </motion.div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <div className="space-y-4">
                          {/* Category and League Badges */}
                          <div className="flex items-center justify-between">
                            <Badge className="bg-white/20 text-white border-white/30 text-xs font-medium">
                              {product.category}
                            </Badge>
                            {product.league && (
                              <Badge 
                                className={`text-xs font-bold px-2 py-1 ${
                                  product.league === 'NBA' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-orange-500 text-white'
                                }`}
                              >
                                {product.league}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Product Name */}
                          <h3 className="font-bold text-xl text-white group-hover:text-brand-grey-300 transition-colors line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-300 font-medium">
                              {product.rating} ({product.review_count} reviews)
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-white">
                              ${product.price}
                            </span>
                            {product.original_price && (
                              <>
                                <span className="text-sm text-gray-400 line-through">
                                  ${product.original_price}
                                </span>
                                <Badge className="bg-red-500 text-white text-xs font-bold">
                                  Save ${(product.original_price - product.price).toFixed(2)}
                                </Badge>
                              </>
                            )}
                          </div>

                          {/* Stock Status */}
                          <div className="flex items-center gap-2">
                            {product.stock_quantity > 0 ? (
                              <>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400 font-semibold text-sm">
                                  In Stock ({product.stock_quantity} available)
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-red-400 font-semibold text-sm">Out of Stock</span>
                              </>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Link href={`/shop/products/${product.id}`} className="flex-1">
                              <Button 
                                variant="outline" 
                                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-semibold transition-all duration-300"
                              >
                                Details
                              </Button>
                            </Link>
                            <Button 
                              className="flex-1 bg-gradient-to-r from-brand-black-700 to-brand-grey-600 hover:from-brand-black-800 hover:to-brand-grey-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={() => addToCart(product)}
                              disabled={!product.inStock}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Products Found */}
          {!loading && filteredProducts.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.div 
                className="text-gray-400 mb-6"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0] 
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ShoppingCart className="w-20 h-20 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">No products found</h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Looks like we don't have any items matching your criteria. Let's try something different!
              </p>
              <Button 
                onClick={() => {
                  setSearch('')
                  setCategory('')
                  setLeague('')
                  setSortBy('featured')
                }}
                className="bg-gradient-to-r from-brand-black-700 to-brand-grey-600 hover:from-brand-black-800 hover:to-brand-grey-700 text-white font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🔄 Clear Filters & Show All
              </Button>
            </motion.div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  )
}