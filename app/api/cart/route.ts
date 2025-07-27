import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Cart API GET - Auth Error:', authError)
    console.log('Cart API GET - User:', user?.id)
    
    if (authError || !user) {
      console.log('Cart API GET - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's cart with product details
    const { data: cartItems, error: cartError } = await supabase
      .from('user_carts')
      .select(`
        id,
        quantity,
        selected_size,
        selected_color,
        created_at,
        products (
          id,
          name,
          price,
          original_price,
          image_url,
          category,
          is_active
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    console.log('Cart API GET - Cart Error:', cartError)
    console.log('Cart API GET - Cart Items:', cartItems)

    if (cartError) {
      console.error('Error fetching cart:', cartError)
      
      // If table doesn't exist, return empty cart instead of error
      if (cartError.code === '42P01') {
        console.log('User carts table does not exist yet, returning empty cart')
        return NextResponse.json({ items: [] })
      }
      
      return NextResponse.json({ error: 'Failed to fetch cart', details: cartError }, { status: 500 })
    }

    // Transform to match frontend CartItem interface
    const transformedCart = cartItems?.map(item => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      return {
        id: product?.id,
        name: product?.name,
        price: product?.price,
        originalPrice: product?.original_price,
        image: product?.image_url,
        category: product?.category,
        selectedSize: item.selected_size,
        selectedColor: item.selected_color,
        quantity: item.quantity,
        inStock: product?.is_active
      }
    }) || []

    return NextResponse.json({ items: transformedCart })
  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1, selectedSize, selectedColor } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from('user_carts')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('selected_size', selectedSize || null)
      .eq('selected_color', selectedColor || null)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing cart item:', checkError)
      return NextResponse.json({ error: 'Failed to check cart' }, { status: 500 })
    }

    let result
    if (existingItem) {
      // Update existing item quantity
      const { data, error } = await supabase
        .from('user_carts')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()

      result = { data, error }
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('user_carts')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
          selected_size: selectedSize || null,
          selected_color: selectedColor || null
        })
        .select()

      result = { data, error }
    }

    if (result.error) {
      console.error('Error adding to cart:', result.error)
      return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity, selectedSize, selectedColor } = body

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 })
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('selected_size', selectedSize || null)
        .eq('selected_color', selectedColor || null)

      if (error) {
        console.error('Error removing cart item:', error)
        return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Item removed from cart' })
    }

    // Update quantity
    const { data, error } = await supabase
      .from('user_carts')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('selected_size', selectedSize || null)
      .eq('selected_color', selectedColor || null)
      .select()

    if (error) {
      console.error('Error updating cart item:', error)
      return NextResponse.json({ error: 'Failed to update item quantity' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    const selectedSize = url.searchParams.get('selectedSize')
    const selectedColor = url.searchParams.get('selectedColor')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_carts')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('selected_size', selectedSize || null)
      .eq('selected_color', selectedColor || null)

    if (error) {
      console.error('Error removing cart item:', error)
      return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Item removed from cart' })
  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}