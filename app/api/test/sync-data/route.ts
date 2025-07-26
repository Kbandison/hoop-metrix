import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

// This is a test endpoint to manually trigger data sync during development
export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Test connection first
    console.log('Testing Supabase connection...')
    const { count: teamsCount, error: testError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })

    if (testError) {
      console.error('Supabase connection error:', testError)
      return NextResponse.json({ 
        error: 'Supabase connection failed', 
        details: testError 
      }, { status: 500 })
    }

    console.log(`Supabase connected! Current teams count: ${teamsCount}`)

    // Insert sample teams to test database
    console.log('Inserting sample teams...')
    
    const sampleTeams = [
      {
        id: '1610612747',
        name: 'Los Angeles Lakers',
        abbreviation: 'LAL',
        city: 'Los Angeles',
        league: 'NBA' as const,
        logo_url: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg',
        conference: 'West',
        division: 'Pacific',
        primary_color: '#552583',
        secondary_color: '#FDB927'
      },
      {
        id: '1610612744',
        name: 'Golden State Warriors',
        abbreviation: 'GSW',
        city: 'Golden State',
        league: 'NBA' as const,
        logo_url: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg',
        conference: 'West',
        division: 'Pacific',
        primary_color: '#1D428A',
        secondary_color: '#FFC72C'
      },
      {
        id: '1611661314',
        name: 'Las Vegas Aces',
        abbreviation: 'LVA',
        city: 'Las Vegas',
        league: 'WNBA' as const,
        logo_url: 'https://cdn.wnba.com/logos/wnba/1611661314/primary/L/logo.svg',
        conference: 'Western',
        division: null,
        primary_color: '#C8102E',
        secondary_color: '#000000'
      }
    ]

    // Insert teams
    let teamsInserted = 0
    for (const team of sampleTeams) {
      const { error } = await supabase
        .from('teams')
        .upsert(team, { onConflict: 'id' })

      if (error) {
        console.error(`Error inserting team ${team.name}:`, error)
      } else {
        console.log(`✅ Inserted team: ${team.name}`)
        teamsInserted++
      }
    }

    // Insert sample players
    console.log('Inserting sample players...')
    
    const samplePlayers = [
      {
        id: '2544', // LeBron James
        name: 'LeBron James',
        team_id: '1610612747',
        league: 'NBA' as const,
        position: 'SF',
        jersey_number: 23,
        height: '6\'9"',
        weight: '250 lbs',
        birth_date: '1984-12-30',
        photo_url: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png',
        is_active: true,
        season_stats: {
          pts: 25.3,
          reb: 7.3,
          ast: 7.4,
          fg_pct: 0.540,
          three_pct: 0.410,
          ft_pct: 0.732,
          gp: 55
        }
      },
      {
        id: '201939', // Stephen Curry
        name: 'Stephen Curry',
        team_id: '1610612744',
        league: 'NBA' as const,
        position: 'PG',
        jersey_number: 30,
        height: '6\'2"',
        weight: '185 lbs',
        birth_date: '1988-03-14',
        photo_url: 'https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png',
        is_active: true,
        season_stats: {
          pts: 26.4,
          reb: 4.5,
          ast: 5.1,
          fg_pct: 0.493,
          three_pct: 0.427,
          ft_pct: 0.913,
          gp: 56
        }
      },
      {
        id: '1628932', // A'ja Wilson  
        name: "A'ja Wilson",
        team_id: '1611661314',
        league: 'WNBA' as const,
        position: 'F',
        jersey_number: 22,
        height: '6\'4"',
        weight: '195 lbs',
        birth_date: '1996-08-08',
        photo_url: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1628932.png',
        is_active: true,
        season_stats: {
          pts: 22.8,
          reb: 9.4,
          ast: 2.3,
          fg_pct: 0.518,
          three_pct: 0.333,
          ft_pct: 0.844,
          gp: 38
        }
      }
    ]

    let playersInserted = 0
    for (const player of samplePlayers) {
      const { error } = await supabase
        .from('players')
        .upsert(player, { onConflict: 'id' })

      if (error) {
        console.error(`Error inserting player ${player.name}:`, error)
      } else {
        console.log(`✅ Inserted player: ${player.name}`)
        playersInserted++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data inserted successfully',
      beforeSync: {
        teams: teamsCount
      },
      inserted: {
        teams: teamsInserted,
        players: playersInserted
      },
      sampleData: {
        teams: sampleTeams.map(t => ({ name: t.name, id: t.id })),
        players: samplePlayers.map(p => ({ name: p.name, id: p.id }))
      }
    })

  } catch (error) {
    console.error('Test sync error:', error)
    
    return NextResponse.json({
      error: 'Test sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}