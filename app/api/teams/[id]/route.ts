import { NextRequest, NextResponse } from 'next/server'
import { getTeamById } from '@/lib/data/teams-index'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params

    // Always try indexed data first for NBA/WNBA teams (more complete data)
    const indexedTeam = getTeamById(teamId)
    if (indexedTeam) {
      return NextResponse.json(indexedTeam)
    }

    // Check if Supabase is configured for fallback
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Original Supabase code
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (error || !team) {
      console.error('Error fetching team:', error)
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json(team)

  } catch (error) {
    console.error('Team API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}