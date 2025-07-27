import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Get all teams with player counts
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        players!inner(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    // Transform data to include player counts
    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id)

        return {
          ...team,
          player_count: count || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      teams: teamsWithCounts
    })

  } catch (error) {
    console.error('Teams API error:', error)
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
      city,
      abbreviation,
      league,
      logo_url,
      primary_color,
      secondary_color,
      conference,
      division
    } = body

    // Validate required fields
    if (!name || !city || !abbreviation || !league) {
      return NextResponse.json(
        { error: 'Missing required fields: name, city, abbreviation, league' },
        { status: 400 }
      )
    }

    // Validate league type - schema only supports NBA/WNBA currently
    if (!['NBA', 'WNBA'].includes(league)) {
      return NextResponse.json(
        { error: 'League must be NBA or WNBA. Custom leagues not supported yet.' },
        { status: 400 }
      )
    }

    // Generate unique team ID
    const teamId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newTeam = {
      id: teamId,
      name,
      city,
      abbreviation,
      league,
      logo_url: logo_url || null,
      primary_color: primary_color || null,
      secondary_color: secondary_color || null,
      conference: conference || null,
      division: division || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('teams')
      .insert([newTeam])
      .select()
      .single()

    if (error) {
      console.error('Error creating team:', error)
      return NextResponse.json({ 
        error: 'Failed to create team',
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      team: { ...data, player_count: 0 },
      message: 'Team created successfully'
    })

  } catch (error) {
    console.error('Create team error:', error)
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
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating team:', error)
      return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      team: data,
      message: 'Team updated successfully'
    })

  } catch (error) {
    console.error('Update team error:', error)
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
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    // First delete all players on this team
    const { error: playersError } = await supabase
      .from('players')
      .delete()
      .eq('team_id', id)

    if (playersError) {
      console.error('Error deleting team players:', playersError)
      return NextResponse.json({ error: 'Failed to delete team players' }, { status: 500 })
    }

    // Then delete the team
    const { error: teamError } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)

    if (teamError) {
      console.error('Error deleting team:', teamError)
      return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Team and all players deleted successfully'
    })

  } catch (error) {
    console.error('Delete team error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}