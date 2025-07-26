import { NextRequest, NextResponse } from 'next/server'
import { getPlayerById } from '@/lib/data/players-index'
import { getTeamById } from '@/lib/data/teams-index'

// Mock player details for when Supabase is not configured
const mockPlayerDetails: Record<string, any> = {
  "1": {
    id: "1",
    name: "LeBron James",
    position: "SF",
    jersey_number: 23,
    height: "6'9\"",
    weight: "250 lbs",
    birth_date: "1984-12-30",
    photo_url: "/Damien Daniels Hoop Metrix.jpg",
    bio: "Widely considered one of the greatest basketball players of all time, LeBron has won multiple championships and MVP awards throughout his career.",
    season_stats: {
      pts: 25.3,
      reb: 7.3,
      ast: 7.4,
      fg_pct: 0.540,
      three_pct: 0.410,
      ft_pct: 0.732,
      gp: 55
    },
    career_stats: {
      pts: 27.2,
      reb: 7.5,
      ast: 7.3,
      fg_pct: 0.505,
      three_pct: 0.345,
      ft_pct: 0.735,
      gp: 1421
    },
    teams: {
      id: "lakers",
      name: "Lakers",
      abbreviation: "LAL", 
      city: "Los Angeles",
      league: "NBA",
      logo_url: "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg",
      primary_color: "#552583",
      secondary_color: "#FDB927"
    }
  },
  "2": {
    id: "2",
    name: "Stephen Curry",
    position: "PG",
    jersey_number: 30,
    height: "6'2\"",
    weight: "185 lbs",
    birth_date: "1988-03-14",
    photo_url: "/Justice Brantley Hoop Metrix.jpg",
    bio: "Revolutionary point guard who changed the game with his exceptional three-point shooting and ball handling skills.",
    season_stats: {
      pts: 26.4,
      reb: 4.5,
      ast: 5.1,
      fg_pct: 0.493,
      three_pct: 0.427,
      ft_pct: 0.913,
      gp: 56
    },
    career_stats: {
      pts: 24.6,
      reb: 4.7,
      ast: 6.5,
      fg_pct: 0.473,
      three_pct: 0.427,
      ft_pct: 0.908,
      gp: 826
    },
    teams: {
      id: "warriors",
      name: "Warriors", 
      abbreviation: "GSW",
      city: "Golden State",
      league: "NBA",
      logo_url: "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg",
      primary_color: "#1D428A",
      secondary_color: "#FFC72C"
    }
  },
  "3": {
    id: "3",
    name: "A'ja Wilson",
    position: "F",
    jersey_number: 22,
    height: "6'4\"",
    weight: "195 lbs",
    birth_date: "1996-08-08",
    photo_url: "/RJ McGee Hoop Metrix.jpg",
    bio: "Dominant WNBA forward and former MVP, known for her versatility and leadership on both ends of the court.",
    season_stats: {
      pts: 22.8,
      reb: 9.4,
      ast: 2.3,
      fg_pct: 0.518,
      three_pct: 0.333,
      ft_pct: 0.844,
      gp: 38
    },
    career_stats: {
      pts: 18.1,
      reb: 8.6,
      ast: 2.0,
      fg_pct: 0.492,
      three_pct: 0.319,
      ft_pct: 0.795,
      gp: 198
    },
    teams: {
      id: "aces",
      name: "Aces",
      abbreviation: "LVA", 
      city: "Las Vegas",
      league: "WNBA",
      logo_url: "https://cdn.wnba.com/logos/wnba/1611661314/primary/L/logo.svg",
      primary_color: "#C8102E",
      secondary_color: "#000000"
    }
  },
  "4": {
    id: "4",
    name: "Breanna Stewart",
    position: "F",
    jersey_number: 30,
    height: "6'4\"",
    weight: "170 lbs",
    birth_date: "1994-08-27",
    photo_url: "/Seth Compas Hoop Metrix.jpg",
    bio: "Elite WNBA forward and former MVP, known for her scoring ability and championship experience.",
    season_stats: {
      pts: 23.0,
      reb: 9.3,
      ast: 3.8,
      fg_pct: 0.460,
      three_pct: 0.354,
      ft_pct: 0.853,
      gp: 40
    },
    career_stats: {
      pts: 19.9,
      reb: 8.4,
      ast: 3.0,
      fg_pct: 0.459,
      three_pct: 0.364,
      ft_pct: 0.859,
      gp: 239
    },
    teams: {
      id: "liberty",
      name: "Liberty", 
      abbreviation: "NY",
      city: "New York", 
      league: "WNBA",
      logo_url: "https://cdn.wnba.com/logos/wnba/1611661316/primary/L/logo.svg",
      primary_color: "#86CEBC",
      secondary_color: "#000000"
    }
  }
}

// Generate mock details for additional players (5-50)
const positions = ["PG", "SG", "SF", "PF", "C"]
const teams = [
  { name: "Lakers", abbrev: "LAL", league: "NBA", primary: "#552583", secondary: "#FDB927" },
  { name: "Warriors", abbrev: "GSW", league: "NBA", primary: "#1D428A", secondary: "#FFC72C" },
  { name: "Celtics", abbrev: "BOS", league: "NBA", primary: "#007A33", secondary: "#BA9653" },
  { name: "Heat", abbrev: "MIA", league: "NBA", primary: "#98002E", secondary: "#F9A01B" },
  { name: "Aces", abbrev: "LVA", league: "WNBA", primary: "#C8102E", secondary: "#000000" },
  { name: "Liberty", abbrev: "NY", league: "WNBA", primary: "#86CEBC", secondary: "#000000" },
  { name: "Storm", abbrev: "SEA", league: "WNBA", primary: "#2C5234", secondary: "#FE5000" },
  { name: "Sky", abbrev: "CHI", league: "WNBA", primary: "#418FDE", secondary: "#FDD023" }
]

for (let i = 5; i <= 50; i++) {
  const team = teams[Math.floor(Math.random() * teams.length)]
  const position = positions[Math.floor(Math.random() * positions.length)]
  
  mockPlayerDetails[i.toString()] = {
    id: i.toString(),
    name: `Player ${i}`,
    position,
    jersey_number: Math.floor(Math.random() * 99) + 1,
    height: `6'${Math.floor(Math.random() * 12)}"`,
    weight: `${180 + Math.floor(Math.random() * 70)} lbs`,
    birth_date: `199${Math.floor(Math.random() * 10)}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
    photo_url: "/placeholder-player.svg",
    bio: `Professional ${team.league} player known for their ${position} skills and team contribution.`,
    season_stats: {
      pts: Math.round((Math.random() * 25 + 5) * 10) / 10,
      reb: Math.round((Math.random() * 10 + 2) * 10) / 10,
      ast: Math.round((Math.random() * 8 + 1) * 10) / 10,
      fg_pct: Math.round((Math.random() * 0.3 + 0.4) * 1000) / 1000,
      three_pct: Math.round((Math.random() * 0.2 + 0.3) * 1000) / 1000,
      ft_pct: Math.round((Math.random() * 0.2 + 0.7) * 1000) / 1000,
      gp: Math.floor(Math.random() * 20) + 50
    },
    career_stats: {
      pts: Math.round((Math.random() * 20 + 10) * 10) / 10,
      reb: Math.round((Math.random() * 8 + 3) * 10) / 10,
      ast: Math.round((Math.random() * 6 + 2) * 10) / 10,
      fg_pct: Math.round((Math.random() * 0.2 + 0.4) * 1000) / 1000,
      three_pct: Math.round((Math.random() * 0.15 + 0.32) * 1000) / 1000,
      ft_pct: Math.round((Math.random() * 0.15 + 0.75) * 1000) / 1000,
      gp: Math.floor(Math.random() * 500) + 200
    },
    teams: {
      id: team.abbrev.toLowerCase(),
      name: team.name,
      abbreviation: team.abbrev,
      city: "City",
      league: team.league as "NBA" | "WNBA",
      logo_url: `https://cdn.${team.league.toLowerCase()}.com/logos/${team.league.toLowerCase()}/team/primary/L/logo.svg`,
      primary_color: team.primary,
      secondary_color: team.secondary
    }
  }
}

const mockSimilarPlayers = [
  {
    id: "2",
    name: "Kevin Durant",
    photo_url: "/Justice Brantley Hoop Metrix.jpg",
    position: "SF",
    teams: {
      abbreviation: "PHX",
      logo_url: "https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg"
    }
  },
  {
    id: "3", 
    name: "Kawhi Leonard",
    photo_url: "/RJ McGee Hoop Metrix.jpg",
    position: "SF",
    teams: {
      abbreviation: "LAC",
      logo_url: "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg"
    }
  },
  {
    id: "4",
    name: "Jayson Tatum", 
    photo_url: "/Seth Compas Hoop Metrix.jpg",
    position: "SF",
    teams: {
      abbreviation: "BOS",
      logo_url: "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg"
    }
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Use indexed data when Supabase is not configured
      const player = getPlayerById(resolvedParams.id)
      
      if (!player) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 })
      }

      // Get team information
      const team = getTeamById(player.team_id)
      
      // Format response similar to what the frontend expects
      const playerData = {
        ...player,
        birth_date: player.birthdate,
        bio: `${player.name} is a professional ${player.league} player.`,
        teams: team
      }
      
      return NextResponse.json({
        player: playerData,
        similarPlayers: mockSimilarPlayers
      })
    }

    // Original Supabase code
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data: player, error } = await supabase
      .from('players')
      .select(`
        *,
        teams (
          id,
          name,
          abbreviation,
          city,
          league,
          logo_url,
          primary_color,
          secondary_color
        )
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 })
      }
      console.error('Error fetching player:', error)
      return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 })
    }

    // Get similar players (same position and league)
    const { data: similarPlayers } = await supabase
      .from('players')
      .select(`
        id,
        name,
        photo_url,
        position,
        teams (
          abbreviation,
          logo_url
        )
      `)
      .eq('position', player.position)
      .neq('id', resolvedParams.id)
      .limit(6)

    return NextResponse.json({
      player,
      similarPlayers: similarPlayers || []
    })

  } catch (error) {
    console.error('Player API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}