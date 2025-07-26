import { NextRequest, NextResponse } from 'next/server'
import { ALL_TEAMS, getTeamsByLeague, searchTeams } from '@/lib/data/teams-index'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Handle Custom league separately
    if (league === 'Custom') {
      // Check if Supabase is configured for custom teams
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return NextResponse.json({
          teams: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        })
      }

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const offset = (page - 1) * limit
      
      let query = supabase
        .from('teams')
        .select('*')
        .eq('league', 'Custom')
        .order('name')
        .range(offset, offset + limit - 1)

      if (search) {
        query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`)
      }

      const { data: teams, error } = await query

      if (error) {
        console.error('Error fetching custom teams:', error)
        return NextResponse.json({ error: 'Failed to fetch custom teams' }, { status: 500 })
      }

      // Get total count for pagination
      let countQuery = supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('league', 'Custom')

      if (search) countQuery = countQuery.or(`name.ilike.%${search}%,city.ilike.%${search}%`)

      const { count, error: countError } = await countQuery

      if (countError) {
        console.error('Error counting custom teams:', countError)
      }

      // Clean up any broken image URLs before returning
      const cleanedTeams = teams?.map(team => ({
        ...team,
        logo_url: team.logo_url?.includes('1594736797933-d0401ba2fe65') 
          ? '/placeholder-team.svg' 
          : team.logo_url
      })) || []

      return NextResponse.json({
        teams: cleanedTeams,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    }

    // For NBA/WNBA teams, use indexed data when Supabase is not configured or as fallback
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (league && ['NBA', 'WNBA'].includes(league))) {
      // Use indexed data for NBA/WNBA teams
      let filteredTeams = Object.values(ALL_TEAMS)
      
      if (league && ['NBA', 'WNBA'].includes(league)) {
        filteredTeams = getTeamsByLeague(league as 'NBA' | 'WNBA')
      }
      
      if (search) {
        filteredTeams = searchTeams(search)
        if (league && ['NBA', 'WNBA'].includes(league)) {
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

    if (league) countQuery = countQuery.eq('league', league)
    if (search) countQuery = countQuery.or(`name.ilike.%${search}%,city.ilike.%${search}%`)

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting teams:', countError)
    }

    // Clean up any broken image URLs before returning
    const cleanedTeams = teams?.map(team => ({
      ...team,
      logo_url: team.logo_url?.includes('1594736797933-d0401ba2fe65') 
        ? '/placeholder-team.svg' 
        : team.logo_url
    })) || []

    return NextResponse.json({
      teams: cleanedTeams,
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