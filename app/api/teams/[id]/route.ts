import { NextRequest, NextResponse } from 'next/server'
import { getTeamById } from '@/lib/data/teams-index'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Use indexed data when Supabase is not configured
      const team = getTeamById(teamId)
      
      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 })
      }
      
      return NextResponse.json(team)
    }

    // Original Supabase code
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .eq('is_active', true)
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