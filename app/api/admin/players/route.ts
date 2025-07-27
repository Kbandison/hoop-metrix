import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Get all players with team information
    const { data: players, error } = await supabase
      .from('players')
      .select(`
        *,
        teams!inner(id, name, city, league, abbreviation)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching players:', error)
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      players: players
    })

  } catch (error) {
    console.error('Players API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    const {
      name,
      team_id,
      league,
      position,
      jersey_number,
      height,
      weight,
      birth_date,
      photo_url,
      bio,
      season_stats,
      career_stats
    } = body

    // Validate required fields
    if (!name || !team_id || !league) {
      return NextResponse.json(
        { error: 'Missing required fields: name, team_id, league' },
        { status: 400 }
      )
    }

    // Verify team exists
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, city')
      .eq('id', team_id)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Generate unique player ID
    const playerId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newPlayer = {
      id: playerId,
      name,
      team_id,
      league,
      position: position || '',
      jersey_number: jersey_number || null,
      height: height || null,
      weight: weight || null,
      birth_date: birth_date || null,
      photo_url: photo_url || null,
      bio: bio || null,
      season_stats: season_stats || null,
      career_stats: career_stats || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('players')
      .insert([newPlayer])
      .select(`
        *,
        teams!inner(id, name, city, league, abbreviation)
      `)
      .single()

    if (error) {
      console.error('Error creating player:', error)
      return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      player: data,
      message: 'Player created successfully'
    })

  } catch (error) {
    console.error('Create player error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        teams!inner(id, name, city, league, abbreviation)
      `)
      .single()

    if (error) {
      console.error('Error updating player:', error)
      return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      player: data,
      message: 'Player updated successfully'
    })

  } catch (error) {
    console.error('Update player error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting player:', error)
      return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully'
    })

  } catch (error) {
    console.error('Delete player error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}