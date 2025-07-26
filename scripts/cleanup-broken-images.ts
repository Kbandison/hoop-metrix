import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function cleanupBrokenImages() {
  console.log('🧹 Starting cleanup of broken image URLs...')

  try {
    // 1. Clean up products with broken Unsplash URLs
    console.log('📦 Cleaning up products...')
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, image_url')
      .like('image_url', '%1594736797933-d0401ba2fe65%')

    if (productsError) {
      console.error('Error fetching products with broken URLs:', productsError)
    } else if (products && products.length > 0) {
      console.log(`Found ${products.length} products with broken URLs:`)
      products.forEach(product => {
        console.log(`- ${product.name}: ${product.image_url}`)
      })

      // Update them with working placeholder URLs
      const updates = products.map(product => ({
        id: product.id,
        image_url: 'https://images.unsplash.com/photo-1506629905607-53e91acd1d3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      }))

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: update.image_url })
          .eq('id', update.id)

        if (updateError) {
          console.error(`Error updating product ${update.id}:`, updateError)
        } else {
          console.log(`✅ Updated product ${update.id}`)
        }
      }
    } else {
      console.log('✅ No products with broken URLs found')
    }

    // 2. Clean up teams with broken logo URLs
    console.log('🏀 Cleaning up teams...')
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, logo_url')
      .like('logo_url', '%1594736797933-d0401ba2fe65%')

    if (teamsError) {
      console.error('Error fetching teams with broken URLs:', teamsError)
    } else if (teams && teams.length > 0) {
      console.log(`Found ${teams.length} teams with broken URLs`)
      
      for (const team of teams) {
        const { error: updateError } = await supabase
          .from('teams')
          .update({ logo_url: '/placeholder-team.svg' })
          .eq('id', team.id)

        if (updateError) {
          console.error(`Error updating team ${team.id}:`, updateError)
        } else {
          console.log(`✅ Updated team ${team.name}`)
        }
      }
    } else {
      console.log('✅ No teams with broken URLs found')
    }

    // 3. Clean up players with broken photo URLs
    console.log('👤 Cleaning up players...')
    
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, name, photo_url')
      .like('photo_url', '%1594736797933-d0401ba2fe65%')

    if (playersError) {
      console.error('Error fetching players with broken URLs:', playersError)
    } else if (players && players.length > 0) {
      console.log(`Found ${players.length} players with broken URLs`)
      
      for (const player of players) {
        const { error: updateError } = await supabase
          .from('players')
          .update({ photo_url: '/placeholder-player.svg' })
          .eq('id', player.id)

        if (updateError) {
          console.error(`Error updating player ${player.id}:`, updateError)
        } else {
          console.log(`✅ Updated player ${player.name}`)
        }
      }
    } else {
      console.log('✅ No players with broken URLs found')
    }

    console.log('🎉 Cleanup completed successfully!')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// Run the cleanup function
cleanupBrokenImages()