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
    
    console.log('POST API - User:', user?.id)
    console.log('POST API - Auth Error:', authError)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1, selectedSize, selectedColor } = body

    console.log('POST API - Adding product:', productId, 'quantity:', quantity, 'size:', selectedSize, 'color:', selectedColor)

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Normalize null/undefined/empty string values
    const normalizedSize = selectedSize && selectedSize.trim() !== '' ? selectedSize.trim() : null
    const normalizedColor = selectedColor && selectedColor.trim() !== '' ? selectedColor.trim() : null

    console.log('POST API - Normalized size:', normalizedSize, 'color:', normalizedColor)

    // First, let's see ALL items for this user and product
    const { data: allProductItems, error: allError } = await supabase
      .from('user_carts')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)

    console.log('POST API - All items for this product:', JSON.stringify(allProductItems, null, 2))
    console.log('POST API - All items error:', allError)

    // Check if item already exists in cart with proper null handling
    let existingItemQuery = supabase
      .from('user_carts')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)

    // Handle null/undefined values properly in Supabase queries
    if (normalizedSize === null) {
      existingItemQuery = existingItemQuery.is('selected_size', null)
    } else {
      existingItemQuery = existingItemQuery.eq('selected_size', normalizedSize)
    }

    if (normalizedColor === null) {
      existingItemQuery = existingItemQuery.is('selected_color', null)
    } else {
      existingItemQuery = existingItemQuery.eq('selected_color', normalizedColor)
    }

    const { data: existingItem, error: checkError } = await existingItemQuery.maybeSingle()

    console.log('POST API - Existing item found:', existingItem)
    console.log('POST API - Check error:', checkError)

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing cart item:', checkError)
      return NextResponse.json({ error: 'Failed to check cart' }, { status: 500 })
    }

    let result
    if (existingItem) {
      // Update existing item quantity
      console.log('POST API - Updating existing item. Current quantity:', existingItem.quantity, 'Adding:', quantity)
      const newQuantity = existingItem.quantity + quantity
      console.log('POST API - New quantity will be:', newQuantity)
      
      const { data, error } = await supabase
        .from('user_carts')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()

      console.log('POST API - Update result:', data)
      console.log('POST API - Update error:', error)
      result = { data, error }
    } else {
      // Insert new item
      console.log('POST API - Inserting new item with quantity:', quantity)
      const { data, error } = await supabase
        .from('user_carts')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
          selected_size: normalizedSize,
          selected_color: normalizedColor
        })
        .select()

      console.log('POST API - Insert result:', data)
      console.log('POST API - Insert error:', error)
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
    
    console.log('PUT API - User:', user?.id)
    console.log('PUT API - Auth Error:', authError)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity, selectedSize, selectedColor } = body

    console.log('PUT API - Update product:', productId, 'to quantity:', quantity, 'size:', selectedSize, 'color:', selectedColor)

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 })
    }

    // Normalize null/undefined/empty string values
    const normalizedSize = selectedSize && selectedSize.trim() !== '' ? selectedSize.trim() : null
    const normalizedColor = selectedColor && selectedColor.trim() !== '' ? selectedColor.trim() : null

    console.log('PUT API - Normalized size:', normalizedSize, 'color:', normalizedColor)

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      console.log('PUT API - Quantity <= 0, removing item')
      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('selected_size', normalizedSize)
        .eq('selected_color', normalizedColor)

      if (error) {
        console.error('Error removing cart item:', error)
        return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
      }

      console.log('PUT API - Item removed successfully')
      return NextResponse.json({ success: true, message: 'Item removed from cart' })
    }

    // Get all items for this product to find the right one to update
    const { data: allProductItems } = await supabase
      .from('user_carts')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)

    console.log('PUT API - All items for this product:', JSON.stringify(allProductItems, null, 2))

    // Find the specific item to update
    const itemToUpdate = allProductItems && allProductItems.length > 0 ? 
      allProductItems.find(item => 
        item.selected_size === normalizedSize && 
        item.selected_color === normalizedColor
      ) : null

    console.log('PUT API - Item to update:', itemToUpdate)

    if (itemToUpdate) {
      // Update by ID instead of multiple conditions
      console.log('PUT API - Updating item by ID:', itemToUpdate.id, 'to quantity:', quantity)
      const { data, error } = await supabase
        .from('user_carts')
        .update({ quantity })
        .eq('id', itemToUpdate.id)
        .select()

      console.log('PUT API - Update result:', data)
      console.log('PUT API - Update error:', error)

      if (error) {
        console.error('Error updating cart item:', error)
        return NextResponse.json({ error: 'Failed to update item quantity' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    } else {
      console.log('PUT API - No item found to update')
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
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
    
    console.log('DELETE API - User:', user?.id)
    console.log('DELETE API - Auth Error:', authError)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    const selectedSize = url.searchParams.get('selectedSize')
    const selectedColor = url.searchParams.get('selectedColor')

    console.log('DELETE API - productId:', productId)
    console.log('DELETE API - selectedSize:', selectedSize)
    console.log('DELETE API - selectedColor:', selectedColor)

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // First, let's see what items exist for this user and product
    const { data: existingItems, error: fetchError } = await supabase
      .from('user_carts')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)

    console.log('DELETE API - Existing items for product:', JSON.stringify(existingItems, null, 2))
    console.log('DELETE API - Fetch error:', fetchError)

    // Let's also check what exact user_id and product_id we're looking for
    console.log('DELETE API - Looking for user_id:', user.id)
    console.log('DELETE API - Looking for product_id:', productId)
    
    // And let's see ALL items for this user
    const { data: allUserItems } = await supabase
      .from('user_carts')
      .select('*')
      .eq('user_id', user.id)
      
    console.log('DELETE API - All items for user:', JSON.stringify(allUserItems, null, 2))

    // Normalize null/undefined/empty string values
    const normalizedSize = selectedSize && selectedSize.trim() !== '' ? selectedSize.trim() : null
    const normalizedColor = selectedColor && selectedColor.trim() !== '' ? selectedColor.trim() : null
    
    console.log('DELETE API - Normalized size:', normalizedSize)
    console.log('DELETE API - Normalized color:', normalizedColor)

    // Since we found the exact item above, let's use its ID directly
    if (existingItems && existingItems.length > 0) {
      const itemToDelete = existingItems.find(item => 
        item.selected_size === normalizedSize && 
        item.selected_color === normalizedColor
      )
      
      if (itemToDelete) {
        console.log('DELETE API - Found exact item to delete:', itemToDelete.id)
        const { data: deletedData, error } = await supabase
          .from('user_carts')
          .delete()
          .eq('id', itemToDelete.id)
          .select()
          
        console.log('DELETE API - Deleted data (by ID):', deletedData)
        console.log('DELETE API - Delete error (by ID):', error)
        
        if (error) {
          console.error('Error removing cart item:', error)
          return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
        }

        console.log('DELETE API - Items deleted (by ID):', deletedData?.length || 0)
        return NextResponse.json({ success: true, message: 'Item removed from cart', deletedCount: deletedData?.length || 0 })
      }
    }
    
    // Fallback to original method if the above doesn't work - with proper null handling
    let deleteQuery = supabase
      .from('user_carts')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    // Handle null/undefined values properly in Supabase queries
    if (normalizedSize === null) {
      deleteQuery = deleteQuery.is('selected_size', null)
    } else {
      deleteQuery = deleteQuery.eq('selected_size', normalizedSize)
    }

    if (normalizedColor === null) {
      deleteQuery = deleteQuery.is('selected_color', null)
    } else {
      deleteQuery = deleteQuery.eq('selected_color', normalizedColor)
    }

    const { data: deletedData, error } = await deleteQuery.select()

    console.log('DELETE API - Deleted data:', deletedData)
    console.log('DELETE API - Delete error:', error)

    if (error) {
      console.error('Error removing cart item:', error)
      return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
    }

    console.log('DELETE API - Items deleted:', deletedData?.length || 0)

    return NextResponse.json({ success: true, message: 'Item removed from cart', deletedCount: deletedData?.length || 0 })
  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}