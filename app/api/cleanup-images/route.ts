import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting cleanup of broken image URLs...')
    
    const supabase = createServiceClient()

    // 1. Clean up products with broken Unsplash URLs
    console.log('📦 Cleaning up products...')
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, image_url')
      .like('image_url', '%1594736797933-d0401ba2fe65%')

    let productsFixed = 0
    if (!productsError && products && products.length > 0) {
      console.log(`Found ${products.length} products with broken URLs`)
      
      for (const product of products) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: 'https://images.unsplash.com/photo-1506629905607-53e91acd1d3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' })
          .eq('id', product.id)

        if (!updateError) {
          productsFixed++
          console.log(`✅ Updated product: ${product.name}`)
        }
      }
    }

    // 2. Clean up teams with broken logo URLs  
    console.log('🏀 Cleaning up teams...')
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, logo_url')
      .like('logo_url', '%1594736797933-d0401ba2fe65%')

    let teamsFixed = 0
    if (!teamsError && teams && teams.length > 0) {
      console.log(`Found ${teams.length} teams with broken URLs`)
      
      for (const team of teams) {
        const { error: updateError } = await supabase
          .from('teams')
          .update({ logo_url: '/placeholder-team.svg' })
          .eq('id', team.id)

        if (!updateError) {
          teamsFixed++
          console.log(`✅ Updated team: ${team.name}`)
        }
      }
    }

    // 3. Clean up players with broken photo URLs
    console.log('👤 Cleaning up players...')
    
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, name, photo_url')
      .like('photo_url', '%1594736797933-d0401ba2fe65%')

    let playersFixed = 0
    if (!playersError && players && players.length > 0) {
      console.log(`Found ${players.length} players with broken URLs`)
      
      for (const player of players) {
        const { error: updateError } = await supabase
          .from('players')
          .update({ photo_url: '/placeholder-player.svg' }) 
          .eq('id', player.id)

        if (!updateError) {
          playersFixed++
          console.log(`✅ Updated player: ${player.name}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Image cleanup completed successfully',
      summary: {
        productsFixed,
        teamsFixed,
        playersFixed
      }
    })

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup images' },
      { status: 500 }
    )
  }
}

// For development - allow GET requests too
export async function GET(request: NextRequest) {
  return POST(request)
}