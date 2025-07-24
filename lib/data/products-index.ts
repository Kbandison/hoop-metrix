// Products Data Index - E-commerce product information for easy lookup and management

export interface ProductData {
  id: string
  name: string
  description: string
  price: number
  category: 'apparel' | 'accessories' | 'collectibles' | 'equipment'
  subcategory?: string
  team_id?: string
  player_id?: string
  league?: 'NBA' | 'WNBA' | 'both'
  sizes?: string[]
  colors?: string[]
  images: string[]
  in_stock: boolean
  stock_quantity?: number
  featured: boolean
  tags: string[]
  created_at?: string
}

// Product Categories and Subcategories
export const PRODUCT_CATEGORIES = {
  apparel: {
    name: 'Apparel',
    subcategories: ['jerseys', 'hoodies', 't-shirts', 'shorts', 'caps', 'socks']
  },
  accessories: {
    name: 'Accessories',
    subcategories: ['bags', 'keychains', 'phone-cases', 'water-bottles', 'towels']
  },
  collectibles: {
    name: 'Collectibles', 
    subcategories: ['trading-cards', 'autographs', 'bobbleheads', 'posters', 'pennants']
  },
  equipment: {
    name: 'Equipment',
    subcategories: ['basketballs', 'shoes', 'training', 'court-equipment']
  }
}

// Sample Products Index (placeholder data)
export const PRODUCTS: Record<string, ProductData> = {
  'lebron-lakers-jersey': {
    id: 'lebron-lakers-jersey',
    name: 'LeBron James Los Angeles Lakers Jersey',
    description: 'Official NBA Nike Swingman Jersey featuring LeBron James #23',
    price: 119.99,
    category: 'apparel',
    subcategory: 'jerseys',
    team_id: 'lakers',
    player_id: 'lebron-james',
    league: 'NBA',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Purple', 'Gold', 'White'],
    images: ['/products/lebron-jersey-1.jpg', '/products/lebron-jersey-2.jpg'],
    in_stock: true,
    stock_quantity: 50,
    featured: true,
    tags: ['jersey', 'lebron', 'lakers', 'nba', 'official'],
  },
  'curry-warriors-jersey': {
    id: 'curry-warriors-jersey',
    name: 'Stephen Curry Golden State Warriors Jersey',
    description: 'Official NBA Nike Swingman Jersey featuring Stephen Curry #30',
    price: 119.99,
    category: 'apparel',
    subcategory: 'jerseys',
    team_id: 'warriors',
    player_id: 'stephen-curry',
    league: 'NBA',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Blue', 'White', 'Yellow'],
    images: ['/products/curry-jersey-1.jpg', '/products/curry-jersey-2.jpg'],
    in_stock: true,
    stock_quantity: 45,
    featured: true,
    tags: ['jersey', 'curry', 'warriors', 'nba', 'official'],
  },
  'aja-wilson-aces-jersey': {
    id: 'aja-wilson-aces-jersey',
    name: "A'ja Wilson Las Vegas Aces Jersey",
    description: "Official WNBA Nike Swingman Jersey featuring A'ja Wilson #22",
    price: 99.99,
    category: 'apparel',
    subcategory: 'jerseys',
    team_id: 'aces',
    player_id: 'aja-wilson',
    league: 'WNBA',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Red', 'Black', 'White'],
    images: ['/products/aja-jersey-1.jpg', '/products/aja-jersey-2.jpg'],
    in_stock: true,
    stock_quantity: 30,
    featured: true,
    tags: ['jersey', 'aja-wilson', 'aces', 'wnba', 'official'],
  },
  'nba-official-basketball': {
    id: 'nba-official-basketball',
    name: 'NBA Official Game Basketball',
    description: 'Official NBA Spalding basketball used in professional games',
    price: 149.99,
    category: 'equipment',
    subcategory: 'basketballs',
    league: 'NBA',
    colors: ['Orange'],
    images: ['/products/nba-basketball-1.jpg', '/products/nba-basketball-2.jpg'],
    in_stock: true,
    stock_quantity: 25,
    featured: false,
    tags: ['basketball', 'spalding', 'nba', 'official', 'game'],
  },
  'lakers-championship-hoodie': {
    id: 'lakers-championship-hoodie',
    name: 'Los Angeles Lakers Championship Hoodie',
    description: 'Celebrate the Lakers championship with this premium hoodie',
    price: 79.99,
    category: 'apparel',
    subcategory: 'hoodies',
    team_id: 'lakers',
    league: 'NBA',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Purple', 'Gold', 'Black'],
    images: ['/products/lakers-hoodie-1.jpg', '/products/lakers-hoodie-2.jpg'],
    in_stock: true,
    stock_quantity: 40,
    featured: false,
    tags: ['hoodie', 'lakers', 'championship', 'nba'],
  },
  'basketball-trading-cards': {
    id: 'basketball-trading-cards',
    name: 'Premium Basketball Trading Cards Pack',
    description: 'Collect your favorite NBA and WNBA players with premium trading cards',
    price: 24.99,
    category: 'collectibles',
    subcategory: 'trading-cards',
    league: 'both',
    images: ['/products/trading-cards-1.jpg', '/products/trading-cards-2.jpg'],
    in_stock: true,
    stock_quantity: 100,
    featured: false,
    tags: ['trading-cards', 'collectibles', 'nba', 'wnba', 'premium'],
  }
}

// Utility functions for product data lookup
export const getProductById = (id: string): ProductData | null => {
  return PRODUCTS[id] || null
}

export const getProductsByCategory = (category: string): ProductData[] => {
  return Object.values(PRODUCTS).filter(product => product.category === category)
}

export const getProductsByTeam = (teamId: string): ProductData[] => {
  return Object.values(PRODUCTS).filter(product => product.team_id === teamId)
}

export const getProductsByPlayer = (playerId: string): ProductData[] => {
  return Object.values(PRODUCTS).filter(product => product.player_id === playerId)
}

export const getFeaturedProducts = (): ProductData[] => {
  return Object.values(PRODUCTS).filter(product => product.featured)
}

export const searchProducts = (query: string): ProductData[] => {
  const searchTerm = query.toLowerCase()
  return Object.values(PRODUCTS).filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  )
}

export const getProductsByPriceRange = (minPrice: number, maxPrice: number): ProductData[] => {
  return Object.values(PRODUCTS).filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  )
}

// Product statistics
export const PRODUCT_STATS = {
  totalProducts: Object.keys(PRODUCTS).length,
  categories: Object.keys(PRODUCT_CATEGORIES).length,
  averagePrice: Math.round(
    Object.values(PRODUCTS).reduce((sum, product) => sum + product.price, 0) / 
    Object.values(PRODUCTS).length * 100
  ) / 100,
  inStockProducts: Object.values(PRODUCTS).filter(product => product.in_stock).length,
  featuredProducts: Object.values(PRODUCTS).filter(product => product.featured).length,
}