import { NextRequest, NextResponse } from 'next/server'
import { ALL_TEAMS, getTeamsByLeague, searchTeams } from '@/lib/data/teams-index'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Use indexed data when Supabase is not configured
      let filteredTeams = Object.values(ALL_TEAMS)
      
      if (league) {
        filteredTeams = getTeamsByLeague(league as 'NBA' | 'WNBA')
      }
      
      if (search) {
        filteredTeams = searchTeams(search)
        if (league) {
          filteredTeams = filteredTeams.filter(t => t.league === league)
        }
      }
      
      // Pagination
      const total = filteredTeams.length
      const totalPages = Math.ceil(total / limit)
      const offset = (page - 1) * limit
      const teams = filteredTeams.slice(offset, offset + limit)
      
      return NextResponse.json({
        teams,
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
      .from('teams')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .range(offset, offset + limit - 1)

    // Apply filters
    if (league) {
      query = query.eq('league', league)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`)
    }

    const { data: teams, error } = await query

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (league) countQuery = countQuery.eq('league', league)
    if (search) countQuery = countQuery.or(`name.ilike.%${search}%,city.ilike.%${search}%`)

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting teams:', countError)
    }

    return NextResponse.json({
      teams,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}