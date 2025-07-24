// Teams Data Index - Centralized team information for easy lookup and management

export interface TeamData {
  id: string
  name: string
  city: string
  fullName: string
  abbreviation: string
  league: 'NBA' | 'WNBA'
  conference?: 'Eastern' | 'Western'
  division?: string
  logo_url: string
  primary_color: string
  secondary_color: string
  founded: number
  championships: number
  playoff_appearances: number
  arena?: string
  location?: string
  website?: string
  social?: {
    twitter?: string
    instagram?: string
    facebook?: string
  }
}

// NBA Teams Index
export const NBA_TEAMS: Record<string, TeamData> = {
  lakers: {
    id: "lakers",
    name: "Lakers",
    city: "Los Angeles",
    fullName: "Los Angeles Lakers",
    abbreviation: "LAL",
    league: "NBA",
    conference: "Western",
    division: "Pacific",
    logo_url: "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg",
    primary_color: "#552583",
    secondary_color: "#FDB927",
    founded: 1947,
    championships: 17,
    playoff_appearances: 62,
    arena: "Crypto.com Arena",
    location: "Los Angeles, California",
    website: "https://www.nba.com/lakers",
    social: {
      twitter: "@Lakers",
      instagram: "@lakers",
      facebook: "LosAngelesLakers"
    }
  },
  warriors: {
    id: "warriors",
    name: "Warriors",
    city: "Golden State",
    fullName: "Golden State Warriors",
    abbreviation: "GSW",
    league: "NBA",
    conference: "Western",
    division: "Pacific",
    logo_url: "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg",
    primary_color: "#1D428A",
    secondary_color: "#FFC72C",
    founded: 1946,
    championships: 7,
    playoff_appearances: 34,
    arena: "Chase Center",
    location: "San Francisco, California",
    website: "https://www.nba.com/warriors",
    social: {
      twitter: "@warriors",
      instagram: "@warriors",
      facebook: "warriors"
    }
  },
  celtics: {
    id: "celtics",
    name: "Celtics",
    city: "Boston",
    fullName: "Boston Celtics",
    abbreviation: "BOS",
    league: "NBA",
    conference: "Eastern",
    division: "Atlantic",
    logo_url: "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg",
    primary_color: "#007A33",
    secondary_color: "#BA9653",
    founded: 1946,
    championships: 18,
    playoff_appearances: 58,
    arena: "TD Garden",
    location: "Boston, Massachusetts",
    website: "https://www.nba.com/celtics",
    social: {
      twitter: "@celtics",
      instagram: "@celtics",
      facebook: "BostonCeltics"
    }
  },
  heat: {
    id: "heat",
    name: "Heat",
    city: "Miami",
    fullName: "Miami Heat",
    abbreviation: "MIA",
    league: "NBA",
    conference: "Eastern",
    division: "Southeast",
    logo_url: "https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg",
    primary_color: "#98002E",
    secondary_color: "#F9A01B",
    founded: 1988,
    championships: 3,
    playoff_appearances: 25,
    arena: "FTX Arena",
    location: "Miami, Florida",
    website: "https://www.nba.com/heat",
    social: {
      twitter: "@MiamiHEAT",
      instagram: "@miamiheat",
      facebook: "MiamiHeat"
    }
  },
  // Additional NBA teams with placeholder data
  nets: {
    id: "nets",
    name: "Nets",
    city: "Brooklyn",
    fullName: "Brooklyn Nets",
    abbreviation: "BKN",
    league: "NBA",
    conference: "Eastern",
    division: "Atlantic",
    logo_url: "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg",
    primary_color: "#000000",
    secondary_color: "#FFFFFF",
    founded: 1967,
    championships: 0,
    playoff_appearances: 28,
    arena: "Barclays Center",
    location: "Brooklyn, New York"
  },
  knicks: {
    id: "knicks",
    name: "Knicks",
    city: "New York",
    fullName: "New York Knicks",
    abbreviation: "NYK",
    league: "NBA",
    conference: "Eastern",
    division: "Atlantic",
    logo_url: "https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg",
    primary_color: "#006BB6",
    secondary_color: "#F58426",
    founded: 1946,
    championships: 2,
    playoff_appearances: 43,
    arena: "Madison Square Garden",
    location: "New York, New York"
  },
  sixers: {
    id: "sixers",
    name: "76ers",
    city: "Philadelphia",
    fullName: "Philadelphia 76ers",
    abbreviation: "PHI",
    league: "NBA",
    conference: "Eastern",
    division: "Atlantic",
    logo_url: "https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg",
    primary_color: "#006BB6",
    secondary_color: "#ED174C",
    founded: 1949,
    championships: 3,
    playoff_appearances: 50,
    arena: "Wells Fargo Center",
    location: "Philadelphia, Pennsylvania"
  },
  raptors: {
    id: "raptors",
    name: "Raptors",
    city: "Toronto",
    fullName: "Toronto Raptors",
    abbreviation: "TOR",
    league: "NBA",
    conference: "Eastern",
    division: "Atlantic",
    logo_url: "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg",
    primary_color: "#CE1141",
    secondary_color: "#000000",
    founded: 1995,
    championships: 1,
    playoff_appearances: 12,
    arena: "Scotiabank Arena",
    location: "Toronto, Ontario"
  },
  bulls: {
    id: "bulls",
    name: "Bulls",
    city: "Chicago",
    fullName: "Chicago Bulls",
    abbreviation: "CHI",
    league: "NBA",
    conference: "Eastern",
    division: "Central",
    logo_url: "https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg",
    primary_color: "#CE1141",
    secondary_color: "#000000",
    founded: 1966,
    championships: 6,
    playoff_appearances: 35,
    arena: "United Center",
    location: "Chicago, Illinois"
  },
  cavaliers: {
    id: "cavaliers",
    name: "Cavaliers",
    city: "Cleveland",
    fullName: "Cleveland Cavaliers",
    abbreviation: "CLE",
    league: "NBA",
    conference: "Eastern",
    division: "Central",
    logo_url: "https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg",
    primary_color: "#860038",
    secondary_color: "#041E42",
    founded: 1970,
    championships: 1,
    playoff_appearances: 22,
    arena: "Rocket Mortgage FieldHouse",
    location: "Cleveland, Ohio"
  }
}

// WNBA Teams Index
export const WNBA_TEAMS: Record<string, TeamData> = {
  aces: {
    id: "aces",
    name: "Aces",
    city: "Las Vegas",
    fullName: "Las Vegas Aces",
    abbreviation: "LVA",
    league: "WNBA",
    conference: "Western",
    logo_url: "https://content.wnba.com/img/teams/logos/LAS_logo.svg",
    primary_color: "#C8102E",
    secondary_color: "#000000",
    founded: 1997,
    championships: 2,
    playoff_appearances: 8,
    arena: "Michelob ULTRA Arena",
    location: "Las Vegas, Nevada",
    website: "https://www.wnba.com/aces",
    social: {
      twitter: "@LVAces",
      instagram: "@lvaces",
      facebook: "LasVegasAces"
    }
  },
  liberty: {
    id: "liberty",
    name: "Liberty",
    city: "New York",
    fullName: "New York Liberty",
    abbreviation: "NY",
    league: "WNBA",
    conference: "Eastern",
    logo_url: "https://content.wnba.com/img/teams/logos/NY_logo.svg",
    primary_color: "#86CEBC",
    secondary_color: "#000000",
    founded: 1997,
    championships: 0,
    playoff_appearances: 12,
    arena: "Barclays Center",
    location: "Brooklyn, New York",
    website: "https://www.wnba.com/liberty",
    social: {
      twitter: "@nyliberty",
      instagram: "@nyliberty",
      facebook: "NewYorkLiberty"
    }
  },
  storm: {
    id: "storm",
    name: "Storm",
    city: "Seattle",
    fullName: "Seattle Storm",
    abbreviation: "SEA",
    league: "WNBA",
    conference: "Western",
    logo_url: "https://content.wnba.com/img/teams/logos/SEA_logo.svg",
    primary_color: "#2C5234",
    secondary_color: "#FE5000",
    founded: 1999,
    championships: 4,
    playoff_appearances: 16,
    arena: "Climate Pledge Arena",
    location: "Seattle, Washington"
  },
  sky: {
    id: "sky",
    name: "Sky",
    city: "Chicago",
    fullName: "Chicago Sky",
    abbreviation: "CHI",
    league: "WNBA",
    conference: "Eastern",
    logo_url: "https://content.wnba.com/img/teams/logos/CHI_logo.svg",
    primary_color: "#418FDE",
    secondary_color: "#FDD023",
    founded: 2006,
    championships: 1,
    playoff_appearances: 9,
    arena: "Wintrust Arena",
    location: "Chicago, Illinois"
  },
  sun: {
    id: "sun",
    name: "Sun",
    city: "Connecticut",
    fullName: "Connecticut Sun",
    abbreviation: "CONN",
    league: "WNBA",
    conference: "Eastern",
    logo_url: "https://content.wnba.com/img/teams/logos/CONN_logo.svg",
    primary_color: "#E03A3E",
    secondary_color: "#041E42",
    founded: 1999,
    championships: 0,
    playoff_appearances: 14,
    arena: "Mohegan Sun Arena",
    location: "Uncasville, Connecticut"
  },
  fever: {
    id: "fever",
    name: "Fever",
    city: "Indiana",
    fullName: "Indiana Fever",
    abbreviation: "IND",
    league: "WNBA",
    conference: "Eastern",
    logo_url: "https://content.wnba.com/img/teams/logos/IND_logo.svg",
    primary_color: "#002D62",
    secondary_color: "#FDBB30",
    founded: 1999,
    championships: 1,
    playoff_appearances: 12,
    arena: "Gainbridge Fieldhouse",
    location: "Indianapolis, Indiana"
  }
}

// Combined Teams Index
export const ALL_TEAMS: Record<string, TeamData> = {
  ...NBA_TEAMS,
  ...WNBA_TEAMS
}

// Utility functions for team data lookup
export const getTeamById = (id: string): TeamData | null => {
  return ALL_TEAMS[id] || null
}

export const getTeamsByLeague = (league: 'NBA' | 'WNBA'): TeamData[] => {
  return Object.values(ALL_TEAMS).filter(team => team.league === league)
}

export const getTeamsByConference = (conference: 'Eastern' | 'Western'): TeamData[] => {
  return Object.values(ALL_TEAMS).filter(team => team.conference === conference)
}

export const searchTeams = (query: string): TeamData[] => {
  const searchTerm = query.toLowerCase()
  return Object.values(ALL_TEAMS).filter(team => 
    team.name.toLowerCase().includes(searchTerm) ||
    team.city.toLowerCase().includes(searchTerm) ||
    team.fullName.toLowerCase().includes(searchTerm) ||
    team.abbreviation.toLowerCase().includes(searchTerm)
  )
}

// Team statistics
export const TEAM_STATS = {
  totalTeams: Object.keys(ALL_TEAMS).length,
  nbaTeams: Object.keys(NBA_TEAMS).length,
  wnbaTeams: Object.keys(WNBA_TEAMS).length,
  totalChampionships: Object.values(ALL_TEAMS).reduce((sum, team) => sum + team.championships, 0),
  oldestTeam: Object.values(ALL_TEAMS).reduce((oldest, team) => 
    team.founded < oldest.founded ? team : oldest
  ),
  newestTeam: Object.values(ALL_TEAMS).reduce((newest, team) => 
    team.founded > newest.founded ? team : newest
  )
}