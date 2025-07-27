import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'featured'

    // Try Supabase first
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const offset = (page - 1) * limit
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (category && category !== 'All') {
        query = query.eq('category', category)
      }
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const { data: products, error } = await query

      if (error) {
        console.error('Error fetching products from Supabase:', error)
        throw error
      }

      // Get total count for pagination
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (category && category !== 'All') countQuery = countQuery.eq('category', category)
      if (search) countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)

      const { count, error: countError } = await countQuery

      if (countError) {
        console.error('Error counting products:', countError)
      }

      // Database query successful

      return NextResponse.json({
        products: products || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    } catch (supabaseError) {
      // Database unavailable, using fallback data
      
      // Fallback to mock data
      const { MOCK_PRODUCTS } = await import('@/lib/services/products')
      
      let filteredProducts = MOCK_PRODUCTS.filter(product => {
        if (!product.is_active) return false
        
        if (category && category !== 'All' && product.category !== category) return false
        
        if (search) {
          const searchTerm = search.toLowerCase()
          const searchable = [
            product.name,
            product.description,
            product.category,
            ...(product.tags || [])
          ].join(' ').toLowerCase()
          
          if (!searchable.includes(searchTerm)) return false
        }
        
        return true
      })

      // Pagination
      const total = filteredProducts.length
      const totalPages = Math.ceil(total / limit)
      const offset = (page - 1) * limit
      const products = filteredProducts.slice(offset, offset + limit)
      
      return NextResponse.json({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      })
    }

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}