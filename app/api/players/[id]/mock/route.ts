import { NextRequest, NextResponse } from 'next/server'

const mockPlayerDetail = {
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
  const { id } = await params
  try {
    // For demo purposes, return the same player for any ID
    // In real implementation, you'd fetch by actual ID
    
    return NextResponse.json({
      player: {
        ...mockPlayerDetail,
        id: id
      },
      similarPlayers: mockSimilarPlayers
    })
    
  } catch (error) {
    console.error('Mock player detail API error:', error)
    return NextResponse.json(
      { error: 'Player not found' },
      { status: 404 }
    )
  }
}