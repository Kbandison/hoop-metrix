import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const { verifyAdminAccess } = await import('@/lib/auth/admin-check')
    const { isAdmin, error: authError } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: authError === 'Not authenticated' ? 401 : 403 })
    }

    // Use service client for admin operations
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    // Get products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Format products for admin panel
    const formattedProducts = products?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock_quantity,
      status: product.stock_quantity > 0 ? 'in_stock' : 'out_of_stock',
      sales: 0, // TODO: Calculate from orders
      rating: 4.5, // TODO: Calculate from reviews
      image: product.image_url?.includes('1594736797933-d0401ba2fe65') 
        ? 'https://images.unsplash.com/photo-1506629905607-53e91acd1d3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
        : product.image_url
    })) || []

    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const { verifyAdminAccess } = await import('@/lib/auth/admin-check')
    const { isAdmin, error: authError } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: authError === 'Not authenticated' ? 401 : 403 })
    }

    // Use service client for admin operations
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { name, price, category, stock, description, image } = await request.json()

    // Validate required fields
    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 })
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        stock_quantity: parseInt(stock) || 0,
        image_url: image || ''
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const { verifyAdminAccess } = await import('@/lib/auth/admin-check')
    const { isAdmin, error: authError } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: authError === 'Not authenticated' ? 401 : 403 })
    }

    // Use service client for admin operations
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { id, name, price, category, stock, description, image } = await request.json()

    // Validate required fields
    if (!id || !name || !price || !category) {
      return NextResponse.json({ error: 'ID, name, price, and category are required' }, { status: 400 })
    }

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        stock_quantity: parseInt(stock) || 0,
        image_url: image || ''
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const { verifyAdminAccess } = await import('@/lib/auth/admin-check')
    const { isAdmin, error: authError } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: authError === 'Not authenticated' ? 401 : 403 })
    }

    // Use service client for admin operations
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}