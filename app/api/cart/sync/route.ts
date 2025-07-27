import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { localCartItems } = body

    if (!Array.isArray(localCartItems)) {
      return NextResponse.json({ error: 'Invalid cart items format' }, { status: 400 })
    }

    // First, get existing cart items from database
    const { data: existingItems, error: fetchError } = await supabase
      .from('user_carts')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError) {
      console.error('Error fetching existing cart:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch existing cart' }, { status: 500 })
    }

    // Merge local cart items with database items
    const itemsToUpsert = []
    
    for (const localItem of localCartItems) {
      const existingItem = existingItems.find(dbItem => 
        dbItem.product_id === localItem.id &&
        dbItem.selected_size === (localItem.selectedSize || null) &&
        dbItem.selected_color === (localItem.selectedColor || null)
      )

      if (existingItem) {
        // Update existing item with higher quantity
        const updateData = {
          id: existingItem.id,
          user_id: user.id,
          product_id: localItem.id,
          quantity: Math.max(existingItem.quantity, localItem.quantity),
          selected_size: localItem.selectedSize || null,
          selected_color: localItem.selectedColor || null
        }
        
        // Update existing item separately to avoid upsert conflicts
        const { error: updateError } = await supabase
          .from('user_carts')
          .update({ quantity: updateData.quantity })
          .eq('id', existingItem.id)
          
        if (updateError) {
          console.error('Error updating existing cart item:', updateError)
        }
      } else {
        // Add new item
        itemsToUpsert.push({
          user_id: user.id,
          product_id: localItem.id,
          quantity: localItem.quantity,
          selected_size: localItem.selectedSize || null,
          selected_color: localItem.selectedColor || null
        })
      }
    }

    // Insert new items
    if (itemsToUpsert.length > 0) {
      const { error: insertError } = await supabase
        .from('user_carts')
        .insert(itemsToUpsert)

      if (insertError) {
        console.error('Error inserting new cart items:', insertError)
        return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
      }
    }

    // Return the merged cart
    const { data: mergedCart, error: finalFetchError } = await supabase
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

    if (finalFetchError) {
      console.error('Error fetching merged cart:', finalFetchError)
      return NextResponse.json({ error: 'Failed to fetch merged cart' }, { status: 500 })
    }

    // Transform to match frontend CartItem interface
    const transformedCart = mergedCart?.map(item => {
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

    return NextResponse.json({ 
      success: true, 
      items: transformedCart,
      message: 'Cart synced successfully'
    })
  } catch (error) {
    console.error('Cart sync API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}