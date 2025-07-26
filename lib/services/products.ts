// Products Service - handles all product-related API calls

import { Product, ProductFilter, ProductSort } from '@/lib/types/product'

// Mock data that matches the enhanced schema structure
// In production, these would come from the database via API calls
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'LeBron James Los Angeles Lakers Jersey',
    description: 'Official NBA Nike Swingman Jersey featuring LeBron James #23',
    price: 119.99,
    original_price: 139.99,
    image_url: '/products/lebron-jersey-1.jpg',
    additional_images: ['/products/lebron-jersey-2.jpg', '/products/lebron-jersey-3.jpg'],
    category: 'Apparel',
    subcategory: 'Jerseys',
    stock_quantity: 50,
    team_id: '1610612747', // Lakers
    player_id: '2544', // LeBron
    league: 'NBA',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Purple', 'Gold', 'White'],
    tags: ['jersey', 'lebron', 'lakers', 'nba', 'official'],
    featured: true,
    is_active: true,
    rating: 4.8,
    review_count: 234,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Stephen Curry Golden State Warriors Jersey',
    description: 'Official NBA Nike Swingman Jersey featuring Stephen Curry #30',
    price: 119.99,
    original_price: null,
    image_url: '/products/curry-jersey-1.jpg',
    additional_images: ['/products/curry-jersey-2.jpg'],
    category: 'Apparel',
    subcategory: 'Jerseys',
    stock_quantity: 45,
    team_id: '1610612744', // Warriors
    player_id: '201939', // Curry
    league: 'NBA',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Blue', 'White', 'Yellow'],
    tags: ['jersey', 'curry', 'warriors', 'nba', 'official'],
    featured: true,
    is_active: true,
    rating: 4.9,
    review_count: 189,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: "A'ja Wilson Las Vegas Aces Jersey",
    description: "Official WNBA Nike Swingman Jersey featuring A'ja Wilson #22",
    price: 99.99,
    original_price: null,
    image_url: '/products/aja-jersey-1.jpg',
    additional_images: ['/products/aja-jersey-2.jpg'],
    category: 'Apparel',
    subcategory: 'Jerseys',
    stock_quantity: 30,
    team_id: 'aces',
    player_id: 'aja-wilson',
    league: 'WNBA',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Red', 'Black', 'White'],
    tags: ['jersey', 'aja-wilson', 'aces', 'wnba', 'official'],
    featured: true,
    is_active: true,
    rating: 4.7,
    review_count: 145,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    name: 'Warriors Championship Hat',
    description: '2022 NBA Champions Golden State Warriors Snapback',
    price: 34.99,
    original_price: null,
    image_url: '/products/warriors-hat-1.jpg',
    additional_images: null,
    category: 'Accessories',
    subcategory: 'Hats',
    stock_quantity: 75,
    team_id: '1610612744', // Warriors
    player_id: null,
    league: 'NBA',
    sizes: ['One Size'],
    colors: ['Blue', 'Gold', 'White'],
    tags: ['hat', 'warriors', 'championship', 'snapback'],
    featured: false,
    is_active: true,
    rating: 4.6,
    review_count: 89,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '5',
    name: 'WNBA All-Star Basketball',
    description: 'Official WNBA All-Star Game Basketball',
    price: 89.99,
    original_price: null,
    image_url: '/products/wnba-basketball-1.jpg',
    additional_images: null,
    category: 'Equipment',
    subcategory: 'Basketballs',
    stock_quantity: 35,
    team_id: null,
    player_id: null,
    league: 'WNBA',
    sizes: null,
    colors: ['Orange'],
    tags: ['basketball', 'wnba', 'all-star', 'official'],
    featured: true,
    is_active: true,
    rating: 4.9,
    review_count: 156,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '6',
    name: 'NBA Official Game Basketball',
    description: 'Official NBA Spalding basketball used in professional games',
    price: 149.99,
    original_price: null,
    image_url: '/products/nba-basketball-1.jpg',
    additional_images: ['/products/nba-basketball-2.jpg'],
    category: 'Equipment',
    subcategory: 'Basketballs',
    stock_quantity: 25,
    team_id: null,
    player_id: null,
    league: 'NBA',
    sizes: null,
    colors: ['Orange'],
    tags: ['basketball', 'spalding', 'nba', 'official', 'game'],
    featured: false,
    is_active: true,
    rating: 4.6,
    review_count: 67,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '7',
    name: 'Los Angeles Lakers Championship Hoodie',
    description: 'Celebrate the Lakers championship with this premium hoodie',
    price: 79.99,
    original_price: null,
    image_url: '/products/lakers-hoodie-1.jpg',
    additional_images: ['/products/lakers-hoodie-2.jpg'],
    category: 'Apparel',
    subcategory: 'Hoodies',
    stock_quantity: 40,
    team_id: '1610612747', // Lakers
    player_id: null,
    league: 'NBA',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Purple', 'Gold', 'Black'],
    tags: ['hoodie', 'lakers', 'championship', 'nba'],
    featured: false,
    is_active: true,
    rating: 4.4,
    review_count: 92,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '8',
    name: 'Premium Basketball Trading Cards Pack',
    description: 'Collect your favorite NBA and WNBA players with premium trading cards',
    price: 24.99,
    original_price: null,
    image_url: '/products/trading-cards-1.jpg',
    additional_images: ['/products/trading-cards-2.jpg'],
    category: 'Collectibles',
    subcategory: 'Trading Cards',
    stock_quantity: 100,
    team_id: null,
    player_id: null,
    league: 'both',
    sizes: null,
    colors: null,
    tags: ['trading-cards', 'collectibles', 'nba', 'wnba', 'premium'],
    featured: false,
    is_active: true,
    rating: 4.3,
    review_count: 78,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
]

// Service functions
export class ProductsService {
  // Get all products with optional filtering and sorting
  static async getProducts(
    filter?: ProductFilter,
    sort?: ProductSort,
    page: number = 1,
    limit: number = 20
  ): Promise<{ products: Product[], total: number, totalPages: number }> {
    // In production, this would make an API call to your backend
    // For now, using mock data with client-side filtering
    
    let filteredProducts = MOCK_PRODUCTS.filter(product => {
      if (!product.is_active) return false
      
      if (filter?.category && product.category !== filter.category) return false
      if (filter?.subcategory && product.subcategory !== filter.subcategory) return false
      if (filter?.team_id && product.team_id !== filter.team_id) return false
      if (filter?.player_id && product.player_id !== filter.player_id) return false
      if (filter?.league && product.league !== filter.league) return false
      if (filter?.featured_only && !product.featured) return false
      if (filter?.in_stock_only && product.stock_quantity <= 0) return false
      if (filter?.min_price && product.price < filter.min_price) return false
      if (filter?.max_price && product.price > filter.max_price) return false
      
      if (filter?.search) {
        const searchTerm = filter.search.toLowerCase()
        const searchable = [
          product.name,
          product.description,
          product.category,
          product.subcategory,
          ...(product.tags || [])
        ].join(' ').toLowerCase()
        
        if (!searchable.includes(searchTerm)) return false
      }
      
      return true
    })
    
    // Sort products
    if (sort) {
      filteredProducts.sort((a, b) => {
        let aValue: any = a[sort.field]
        let bValue: any = b[sort.field]
        
        if (sort.field === 'created_at') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }
        
        if (sort.direction === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }
    
    // Pagination
    const total = filteredProducts.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return {
      products: paginatedProducts,
      total,
      totalPages
    }
  }
  
  // Get a single product by ID
  static async getProductById(id: string): Promise<Product | null> {
    // In production, this would make an API call
    const product = MOCK_PRODUCTS.find(p => p.id === id && p.is_active)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return product || null
  }
  
  // Get featured products
  static async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    const { products } = await this.getProducts({ featured_only: true }, undefined, 1, limit)
    return products
  }
  
  // Get products by category
  static async getProductsByCategory(category: string, limit?: number): Promise<Product[]> {
    const { products } = await this.getProducts({ category }, undefined, 1, limit)
    return products
  }
  
  // Get products by team
  static async getProductsByTeam(teamId: string, limit?: number): Promise<Product[]> {
    const { products } = await this.getProducts({ team_id: teamId }, undefined, 1, limit)
    return products
  }
  
  // Get products by player
  static async getProductsByPlayer(playerId: string, limit?: number): Promise<Product[]> {
    const { products } = await this.getProducts({ player_id: playerId }, undefined, 1, limit)
    return products
  }
  
  // Search products
  static async searchProducts(query: string, limit?: number): Promise<Product[]> {
    const { products } = await this.getProducts({ search: query }, undefined, 1, limit)
    return products
  }
}