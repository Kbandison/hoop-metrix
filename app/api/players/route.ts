import { NextRequest, NextResponse } from 'next/server'
import { ALL_PLAYERS, getPlayersByLeague, getPlayersByPosition, searchPlayers } from '@/lib/data/players-index'
import { getTeamById } from '@/lib/data/teams-index'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    const position = searchParams.get('position')
    const team = searchParams.get('team')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Use indexed data when Supabase is not configured
      let filteredPlayers = Object.values(ALL_PLAYERS)
      
      if (league) {
        filteredPlayers = getPlayersByLeague(league as 'NBA' | 'WNBA')
      }
      
      if (position) {
        filteredPlayers = getPlayersByPosition(position)
        if (league) {
          filteredPlayers = filteredPlayers.filter(p => p.league === league)
        }
      }
      
      if (search) {
        filteredPlayers = searchPlayers(search)
        if (league) {
          filteredPlayers = filteredPlayers.filter(p => p.league === league)
        }
        if (position) {
          filteredPlayers = filteredPlayers.filter(p => p.position === position)
        }
      }
      
      // Transform data to match API format (add team info)
      const playersWithTeams = filteredPlayers.map(player => ({
        ...player,
        teams: getTeamById(player.team_id)
      }))
      
      // Pagination
      const total = playersWithTeams.length
      const totalPages = Math.ceil(total / limit)
      const offset = (page - 1) * limit
      const players = playersWithTeams.slice(offset, offset + limit)
      
      return NextResponse.json({
        players,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      })
    }

    // Original Supabase code
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('players')
      .select(`
        *,
        teams (
          id,
          name,
          abbreviation,
          city,
          league,
          logo_url
        )
      `)
      .eq('is_active', true)
      .order('name')
      .range(offset, offset + limit - 1)

    // Apply filters
    if (league) {
      query = query.eq('league', league)
    }
    
    if (position) {
      query = query.eq('position', position)
    }
    
    if (team) {
      query = query.eq('team_id', team)
    }
    
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: players, error } = await query

    if (error) {
      console.error('Error fetching players:', error)
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (league) countQuery = countQuery.eq('league', league)
    if (position) countQuery = countQuery.eq('position', position)
    if (team) countQuery = countQuery.eq('team_id', team)
    if (search) countQuery = countQuery.ilike('name', `%${search}%`)

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting players:', countError)
    }

    return NextResponse.json({
      players,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Players API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}