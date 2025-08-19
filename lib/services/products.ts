// Products Service - handles all product-related API calls

import { Product, ProductFilter, ProductSort } from '@/lib/types/product'

// All product data now comes from database - no mock data

// Service functions
export class ProductsService {
  // Get all products with optional filtering and sorting
  static async getProducts(
    filter?: ProductFilter,
    sort?: ProductSort,
    page: number = 1,
    limit: number = 20
  ): Promise<{ products: Product[], total: number, totalPages: number }> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      if (filter?.category) params.append('category', filter.category)
      if (filter?.search) params.append('search', filter.search)
      if (sort?.field) params.append('sort', sort.field)

      // Fetch from API
      const response = await fetch(`/api/products?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return {
        products: data.products,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }
    } catch (error) {
      console.error('Error fetching products from API:', error)
      
      // No fallback - return empty results
      return {
        products: [],
        total: 0,
        totalPages: 0
      }
    }
  }
  
  // Get a single product by ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`/api/products/${id}`)
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      return data.product || null
    } catch (error) {
      console.error('Error fetching product by ID:', error)
      return null
    }
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