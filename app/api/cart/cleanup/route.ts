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

    // Get all cart items for the user
    const { data: cartItems, error: fetchError } = await supabase
      .from('user_carts')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError) {
      console.error('Error fetching cart items:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 })
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ message: 'No cart items to cleanup' })
    }

    // Group items by product_id, selected_size, selected_color
    const groupedItems = new Map<string, any[]>()
    
    cartItems.forEach(item => {
      const key = `${item.product_id}-${item.selected_size || ''}-${item.selected_color || ''}`
      if (!groupedItems.has(key)) {
        groupedItems.set(key, [])
      }
      groupedItems.get(key)!.push(item)
    })

    // Find and consolidate duplicates
    const consolidatedItems: any[] = []
    const itemsToDelete: string[] = []

    groupedItems.forEach((items, key) => {
      if (items.length > 1) {
        // Multiple items found - consolidate them
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
        const keepItem = items[0] // Keep the first one
        const deleteItems = items.slice(1) // Delete the rest
        
        consolidatedItems.push({
          id: keepItem.id,
          quantity: totalQuantity
        })
        
        deleteItems.forEach(item => itemsToDelete.push(item.id))
      }
    })

    console.log(`Found ${consolidatedItems.length} items to consolidate`)
    console.log(`Found ${itemsToDelete.length} duplicate items to delete`)

    // Delete duplicate items
    if (itemsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_carts')
        .delete()
        .in('id', itemsToDelete)

      if (deleteError) {
        console.error('Error deleting duplicate items:', deleteError)
        return NextResponse.json({ error: 'Failed to delete duplicates' }, { status: 500 })
      }
    }

    // Update quantities for consolidated items
    for (const item of consolidatedItems) {
      const { error: updateError } = await supabase
        .from('user_carts')
        .update({ quantity: item.quantity })
        .eq('id', item.id)

      if (updateError) {
        console.error('Error updating item quantity:', updateError)
        return NextResponse.json({ error: 'Failed to update quantities' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      message: 'Cart cleaned up successfully',
      consolidated_items: consolidatedItems.length,
      deleted_duplicates: itemsToDelete.length
    })
  } catch (error) {
    console.error('Cart cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}