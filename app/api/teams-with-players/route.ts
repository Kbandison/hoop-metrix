import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const league = searchParams.get('league') || ''
    
    const offset = (page - 1) * limit

    // Build base query for counting - simplified approach
    let countQuery = supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,city.ilike.%${search}%`)
    }
    
    if (league) {
      if (league === 'Custom') {
        // Filter for custom teams by ID prefix
        countQuery = countQuery.like('id', 'custom_%')
      } else {
        countQuery = countQuery.eq('league', league)
      }
    }

    // Get total count
    const { count } = await countQuery

    // Build query for teams data
    let teamsQuery = supabase
      .from('teams')
      .select('*')
      .order('name')
      .range(offset, offset + limit - 1)

    if (search) {
      teamsQuery = teamsQuery.or(`name.ilike.%${search}%,city.ilike.%${search}%`)
    }
    
    if (league) {
      if (league === 'Custom') {
        // Filter for custom teams by ID prefix
        teamsQuery = teamsQuery.like('id', 'custom_%')
      } else {
        teamsQuery = teamsQuery.eq('league', league)
      }
    }

    const { data: teams, error: teamsError } = await teamsQuery

    if (teamsError) {
      console.error('Error fetching teams:', teamsError)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    if (!teams || teams.length === 0) {
      return NextResponse.json({
        teams: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      })
    }

    // Get all players for these teams in a single query with limit to prevent large datasets
    const teamIds = teams.map(team => team.id)
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, name, position, jersey_number, team_id')
      .in('team_id', teamIds)
      .order('jersey_number')
      .limit(500) // Prevent excessive player data

    if (playersError) {
      console.error('Error fetching players:', playersError)
      // Continue without players rather than failing
    }

    // Group players by team_id
    const playersByTeam: Record<string, any[]> = {}
    if (players) {
      players.forEach(player => {
        if (!playersByTeam[player.team_id]) {
          playersByTeam[player.team_id] = []
        }
        playersByTeam[player.team_id].push(player)
      })
    }

    // Attach players to teams
    const teamsWithPlayers = teams.map(team => ({
      ...team,
      players: playersByTeam[team.id] || []
    }))

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      teams: teamsWithPlayers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })

  } catch (error) {
    console.error('Teams with players API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}