// Unified Product Types - matches Supabase enhanced schema

export interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number | null
  image_url: string
  additional_images?: string[] | null
  category: string
  subcategory?: string | null
  stock_quantity: number
  
  // NBA/WNBA specific fields
  team_id?: string | null
  player_id?: string | null
  league?: string | null
  
  // Product variants
  sizes?: string[] | null
  colors?: string[] | null
  
  // Product metadata
  tags?: string[] | null
  featured: boolean
  is_active: boolean
  
  // Ratings
  rating: number
  review_count: number
  
  created_at: string
  updated_at: string
}

export interface CartItem extends Product {
  quantity: number
  selected_size?: string
  selected_color?: string
  cart_item_key: string // Unique key for cart (id + size + color)
}

export interface ProductFilter {
  category?: string
  subcategory?: string
  team_id?: string
  player_id?: string
  league?: string
  min_price?: number
  max_price?: number
  in_stock_only?: boolean
  featured_only?: boolean
  search?: string
}

export interface ProductSort {
  field: 'name' | 'price' | 'rating' | 'created_at'
  direction: 'asc' | 'desc'
}

// Product categories that match the database
export const PRODUCT_CATEGORIES = {
  'Apparel': {
    name: 'Apparel',
    subcategories: ['Jerseys', 'Hoodies', 'T-Shirts', 'Shorts', 'Caps', 'Socks']
  },
  'Accessories': {
    name: 'Accessories', 
    subcategories: ['Bags', 'Hats', 'Keychains', 'Phone Cases', 'Water Bottles', 'Towels']
  },
  'Collectibles': {
    name: 'Collectibles',
    subcategories: ['Trading Cards', 'Autographs', 'Bobbleheads', 'Posters', 'Pennants']
  },
  'Equipment': {
    name: 'Equipment',
    subcategories: ['Basketballs', 'Shoes', 'Training', 'Court Equipment']
  }
} as const

export type ProductCategory = keyof typeof PRODUCT_CATEGORIES
export type ProductSubcategory = typeof PRODUCT_CATEGORIES[ProductCategory]['subcategories'][number]