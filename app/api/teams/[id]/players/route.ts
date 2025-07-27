import { NextRequest, NextResponse } from 'next/server'
import { getPlayersByTeam } from '@/lib/data/players-index'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params
    console.log('API: Fetching players for team ID:', teamId)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Use indexed data when Supabase is not configured
      console.log('API: Using indexed data (Supabase not configured)')
      const players = getPlayersByTeam(teamId)
      console.log('API: Found', players.length, 'players for team:', teamId)
      
      return NextResponse.json({
        players,
        total: players.length
      })
    }

    // Original Supabase code
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data: players, error } = await supabase
      .from('players')
      .select('id, name, position, jersey_number, season_stats')
      .eq('team_id', teamId)
      .order('jersey_number')

    if (error) {
      console.error('Error fetching team players:', error)
      return NextResponse.json({ error: 'Failed to fetch team players' }, { status: 500 })
    }

    return NextResponse.json({
      players: players || [],
      total: players?.length || 0
    })

  } catch (error) {
    console.error('Team players API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}