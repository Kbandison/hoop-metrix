import { createClient } from '@supabase/supabase-js'

async function fixCartDuplicates() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Get all cart items
    const { data: allItems, error } = await supabase
      .from('user_carts')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching cart items:', error)
      return
    }

    console.log(`Found ${allItems?.length || 0} total cart items`)

    if (!allItems || allItems.length === 0) {
      console.log('No cart items found')
      return
    }

    // Group items by user_id, product_id, selected_size, selected_color
    const groupedItems = new Map<string, any[]>()

    for (const item of allItems) {
      const key = `${item.user_id}-${item.product_id}-${item.selected_size || 'null'}-${item.selected_color || 'null'}`
      
      if (!groupedItems.has(key)) {
        groupedItems.set(key, [])
      }
      groupedItems.get(key)!.push(item)
    }

    console.log(`Found ${groupedItems.size} unique item groups`)

    let duplicatesFixed = 0
    let totalQuantityMerged = 0

    // Process each group
    for (const [key, items] of groupedItems) {
      if (items.length > 1) {
        console.log(`\nProcessing duplicate group: ${key}`)
        console.log(`Found ${items.length} duplicate items:`, items.map(item => ({ id: item.id, quantity: item.quantity })))

        // Calculate total quantity
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
        totalQuantityMerged += totalQuantity

        // Keep the first item (oldest) and update its quantity
        const keepItem = items[0]
        const itemsToDelete = items.slice(1)

        console.log(`Keeping item ${keepItem.id} with total quantity ${totalQuantity}`)
        console.log(`Deleting items: ${itemsToDelete.map(item => item.id).join(', ')}`)

        // Update the kept item with total quantity
        const { error: updateError } = await supabase
          .from('user_carts')
          .update({ quantity: totalQuantity })
          .eq('id', keepItem.id)

        if (updateError) {
          console.error(`Error updating item ${keepItem.id}:`, updateError)
          continue
        }

        // Delete duplicate items
        for (const itemToDelete of itemsToDelete) {
          const { error: deleteError } = await supabase
            .from('user_carts')
            .delete()
            .eq('id', itemToDelete.id)

          if (deleteError) {
            console.error(`Error deleting item ${itemToDelete.id}:`, deleteError)
          } else {
            console.log(`Deleted duplicate item ${itemToDelete.id}`)
          }
        }

        duplicatesFixed++
      }
    }

    console.log(`\nCompleted fixing cart duplicates:`)
    console.log(`- ${duplicatesFixed} duplicate groups fixed`)
    console.log(`- ${totalQuantityMerged} total items preserved through merging`)

  } catch (error) {
    console.error('Error fixing cart duplicates:', error)
  }
}

// Run the script
fixCartDuplicates().then(() => {
  console.log('Cart duplicate fix completed')
  process.exit(0)
}).catch(error => {
  console.error('Script failed:', error)
  process.exit(1)
})