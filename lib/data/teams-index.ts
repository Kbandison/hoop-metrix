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
  },
  bucks: {
    id: "bucks",
    name: "Bucks",
    city: "Milwaukee",
    fullName: "Milwaukee Bucks",
    abbreviation: "MIL",
    league: "NBA",
    conference: "Eastern",
    division: "Central",
    logo_url: "https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg",
    primary_color: "#00471B",
    secondary_color: "#EEE1C6",
    founded: 1968,
    championships: 2,
    playoff_appearances: 33,
    arena: "Fiserv Forum",
    location: "Milwaukee, Wisconsin"
  },
  pistons: {
    id: "pistons",
    name: "Pistons",
    city: "Detroit",
    fullName: "Detroit Pistons",
    abbreviation: "DET",
    league: "NBA",
    conference: "Eastern",
    division: "Central",
    logo_url: "https://cdn.nba.com/logos/nba/1610612765/primary/L/logo.svg",
    primary_color: "#C8102E",
    secondary_color: "#006BB6",
    founded: 1941,
    championships: 3,
    playoff_appearances: 41,
    arena: "Little Caesars Arena",
    location: "Detroit, Michigan"
  },
  pacers: {
    id: "pacers",
    name: "Pacers",
    city: "Indiana",
    fullName: "Indiana Pacers",
    abbreviation: "IND",
    league: "NBA",
    conference: "Eastern",
    division: "Central",
    logo_url: "https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg",
    primary_color: "#002D62",
    secondary_color: "#FDBB30",
    founded: 1967,
    championships: 0,
    playoff_appearances: 32,
    arena: "Gainbridge Fieldhouse",
    location: "Indianapolis, Indiana"
  },
  hawks: {
    id: "hawks",
    name: "Hawks",
    city: "Atlanta",
    fullName: "Atlanta Hawks",
    abbreviation: "ATL",
    league: "NBA",
    conference: "Eastern",
    division: "Southeast",
    logo_url: "https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg",
    primary_color: "#E03A3E",
    secondary_color: "#C1D32F",
    founded: 1946,
    championships: 1,
    playoff_appearances: 48,
    arena: "State Farm Arena",
    location: "Atlanta, Georgia"
  },
  magic: {
    id: "magic",
    name: "Magic",
    city: "Orlando",
    fullName: "Orlando Magic",
    abbreviation: "ORL",
    league: "NBA",
    conference: "Eastern",
    division: "Southeast",
    logo_url: "https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg",
    primary_color: "#0077C0",
    secondary_color: "#C4CED4",
    founded: 1989,
    championships: 0,
    playoff_appearances: 16,
    arena: "Amway Center",
    location: "Orlando, Florida"
  },
  hornets: {
    id: "hornets",
    name: "Hornets",
    city: "Charlotte",
    fullName: "Charlotte Hornets",
    abbreviation: "CHA",
    league: "NBA",
    conference: "Eastern",
    division: "Southeast",
    logo_url: "https://cdn.nba.com/logos/nba/1610612766/primary/L/logo.svg",
    primary_color: "#1D1160",
    secondary_color: "#00788C",
    founded: 1988,
    championships: 0,
    playoff_appearances: 10,
    arena: "Spectrum Center",
    location: "Charlotte, North Carolina"
  },
  wizards: {
    id: "wizards",
    name: "Wizards",
    city: "Washington",
    fullName: "Washington Wizards",
    abbreviation: "WAS",
    league: "NBA",
    conference: "Eastern",
    division: "Southeast",
    logo_url: "https://cdn.nba.com/logos/nba/1610612764/primary/L/logo.svg",
    primary_color: "#002B5C",
    secondary_color: "#E31837",
    founded: 1961,
    championships: 1,
    playoff_appearances: 28,
    arena: "Capital One Arena",
    location: "Washington, D.C."
  },
  spurs: {
    id: "spurs",
    name: "Spurs",
    city: "San Antonio",
    fullName: "San Antonio Spurs",
    abbreviation: "SAS",
    league: "NBA",
    conference: "Western",
    division: "Southwest",
    logo_url: "https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg",
    primary_color: "#C4CED4",
    secondary_color: "#000000",
    founded: 1967,
    championships: 5,
    playoff_appearances: 46,
    arena: "Frost Bank Center",
    location: "San Antonio, Texas"
  },
  mavs: {
    id: "mavs",
    name: "Mavericks",
    city: "Dallas",
    fullName: "Dallas Mavericks",
    abbreviation: "DAL",
    league: "NBA",
    conference: "Western",
    division: "Southwest",
    logo_url: "https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg",
    primary_color: "#00538C",
    secondary_color: "#002F5F",
    founded: 1980,
    championships: 1,
    playoff_appearances: 24,
    arena: "American Airlines Center",
    location: "Dallas, Texas"
  },
  nuggets: {
    id: "nuggets",
    name: "Nuggets",
    city: "Denver",
    fullName: "Denver Nuggets",
    abbreviation: "DEN",
    league: "NBA",
    conference: "Western",
    division: "Northwest",
    logo_url: "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg",
    primary_color: "#0E2240",
    secondary_color: "#FEC524",
    founded: 1967,
    championships: 1,
    playoff_appearances: 30,
    arena: "Ball Arena",
    location: "Denver, Colorado"
  },
  suns: {
    id: "suns",
    name: "Suns",
    city: "Phoenix",
    fullName: "Phoenix Suns",
    abbreviation: "PHX",
    league: "NBA",
    conference: "Western",
    division: "Pacific",
    logo_url: "https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg",
    primary_color: "#1D1160",
    secondary_color: "#E56020",
    founded: 1968,
    championships: 0,
    playoff_appearances: 31,
    arena: "Footprint Center",
    location: "Phoenix, Arizona"
  },
  clippers: {
    id: "clippers",
    name: "Clippers",
    city: "LA",
    fullName: "LA Clippers",
    abbreviation: "LAC",
    league: "NBA",
    conference: "Western",
    division: "Pacific",
    logo_url: "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg",
    primary_color: "#C8102E",
    secondary_color: "#1D428A",
    founded: 1970,
    championships: 0,
    playoff_appearances: 19,
    arena: "Intuit Dome",
    location: "Inglewood, California"
  },
  grizzlies: {
    id: "grizzlies",
    name: "Grizzlies",
    city: "Memphis",
    fullName: "Memphis Grizzlies",
    abbreviation: "MEM",
    league: "NBA",
    conference: "Western",
    division: "Southwest",
    logo_url: "https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg",
    primary_color: "#5D76A9",
    secondary_color: "#12173F",
    founded: 1995,
    championships: 0,
    playoff_appearances: 13,
    arena: "FedExForum",
    location: "Memphis, Tennessee"
  },
  jazz: {
    id: "jazz",
    name: "Jazz",
    city: "Utah",
    fullName: "Utah Jazz",
    abbreviation: "UTA",
    league: "NBA",
    conference: "Western",
    division: "Northwest",
    logo_url: "https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg",
    primary_color: "#002B5C",
    secondary_color: "#00471B",
    founded: 1974,
    championships: 0,
    playoff_appearances: 31,
    arena: "Delta Center",
    location: "Salt Lake City, Utah"
  },
  kings: {
    id: "kings",
    name: "Kings",
    city: "Sacramento",
    fullName: "Sacramento Kings",
    abbreviation: "SAC",
    league: "NBA",
    conference: "Western",
    division: "Pacific",
    logo_url: "https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg",
    primary_color: "#5A2D81",
    secondary_color: "#63727A",
    founded: 1945,
    championships: 1,
    playoff_appearances: 30,
    arena: "Golden 1 Center",
    location: "Sacramento, California"
  },
  pelicans: {
    id: "pelicans",
    name: "Pelicans",
    city: "New Orleans",
    fullName: "New Orleans Pelicans",
    abbreviation: "NOP",
    league: "NBA",
    conference: "Western",
    division: "Southwest",
    logo_url: "https://cdn.nba.com/logos/nba/1610612740/primary/L/logo.svg",
    primary_color: "#0C2340",
    secondary_color: "#C8102E",
    founded: 2002,
    championships: 0,
    playoff_appearances: 9,
    arena: "Smoothie King Center",
    location: "New Orleans, Louisiana"
  },
  rockets: {
    id: "rockets",
    name: "Rockets",
    city: "Houston",
    fullName: "Houston Rockets",
    abbreviation: "HOU",
    league: "NBA",
    conference: "Western",
    division: "Southwest",
    logo_url: "https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg",
    primary_color: "#CE1141",
    secondary_color: "#000000",
    founded: 1967,
    championships: 2,
    playoff_appearances: 34,
    arena: "Toyota Center",
    location: "Houston, Texas"
  },
  thunder: {
    id: "thunder",
    name: "Thunder",
    city: "Oklahoma City",
    fullName: "Oklahoma City Thunder",
    abbreviation: "OKC",
    league: "NBA",
    conference: "Western",
    division: "Northwest",
    logo_url: "https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg",
    primary_color: "#007AC1",
    secondary_color: "#EF3B24",
    founded: 1967,
    championships: 1,
    playoff_appearances: 34,
    arena: "Paycom Center",
    location: "Oklahoma City, Oklahoma"
  },
  blazers: {
    id: "blazers",
    name: "Trail Blazers",
    city: "Portland",
    fullName: "Portland Trail Blazers",
    abbreviation: "POR",
    league: "NBA",
    conference: "Western",
    division: "Northwest",
    logo_url: "https://cdn.nba.com/logos/nba/1610612757/primary/L/logo.svg",
    primary_color: "#E03A3E",
    secondary_color: "#000000",
    founded: 1970,
    championships: 1,
    playoff_appearances: 37,
    arena: "Moda Center",
    location: "Portland, Oregon"
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

// NBA Team ID to Custom Key Mapping (all 30 NBA teams now included)
const NBA_ID_TO_KEY: Record<string, string> = {
  '1610612747': 'lakers', // Los Angeles Lakers
  '1610612744': 'warriors', // Golden State Warriors
  '1610612738': 'celtics', // Boston Celtics
  '1610612748': 'heat', // Miami Heat
  '1610612751': 'nets', // Brooklyn Nets
  '1610612752': 'knicks', // New York Knicks
  '1610612755': 'sixers', // Philadelphia 76ers
  '1610612761': 'raptors', // Toronto Raptors
  '1610612741': 'bulls', // Chicago Bulls
  '1610612739': 'cavaliers', // Cleveland Cavaliers
  '1610612749': 'bucks', // Milwaukee Bucks
  '1610612765': 'pistons', // Detroit Pistons
  '1610612754': 'pacers', // Indiana Pacers
  '1610612737': 'hawks', // Atlanta Hawks
  '1610612753': 'magic', // Orlando Magic
  '1610612766': 'hornets', // Charlotte Hornets
  '1610612764': 'wizards', // Washington Wizards
  '1610612759': 'spurs', // San Antonio Spurs
  '1610612742': 'mavs', // Dallas Mavericks
  '1610612743': 'nuggets', // Denver Nuggets
  '1610612756': 'suns', // Phoenix Suns
  '1610612746': 'clippers', // LA Clippers
  '1610612763': 'grizzlies', // Memphis Grizzlies
  '1610612762': 'jazz', // Utah Jazz
  '1610612758': 'kings', // Sacramento Kings
  '1610612740': 'pelicans', // New Orleans Pelicans
  '1610612745': 'rockets', // Houston Rockets
  '1610612760': 'thunder', // Oklahoma City Thunder
  '1610612757': 'blazers' // Portland Trail Blazers
}

// WNBA Team ID to Custom Key Mapping (all 12 WNBA teams)
const WNBA_ID_TO_KEY: Record<string, string> = {
  '1611661314': 'aces', // Las Vegas Aces
  '1611661316': 'liberty', // New York Liberty
  '1611661315': 'sky', // Chicago Sky
  '1611661322': 'storm', // Seattle Storm
  '1611661318': 'sun', // Connecticut Sun
  '1611661313': 'dream', // Atlanta Dream
  '1611661317': 'fever', // Indiana Fever
  '1611661320': 'lynx', // Minnesota Lynx
  '1611661321': 'mercury', // Phoenix Mercury
  '1611661319': 'mystics', // Washington Mystics
  '1611661323': 'wings', // Dallas Wings
  '1611661324': 'sparks' // Los Angeles Sparks
}

// Utility functions for team data lookup
export const getTeamById = (id: string): TeamData | null => {
  // First try direct key lookup
  const teamByKey = ALL_TEAMS[id]
  if (teamByKey) return teamByKey
  
  // Try NBA ID to key mapping
  const nbaCustomKey = NBA_ID_TO_KEY[id]
  if (nbaCustomKey && ALL_TEAMS[nbaCustomKey]) {
    return ALL_TEAMS[nbaCustomKey]
  }
  
  // Try WNBA ID to key mapping
  const wnbaCustomKey = WNBA_ID_TO_KEY[id]
  if (wnbaCustomKey && ALL_TEAMS[wnbaCustomKey]) {
    return ALL_TEAMS[wnbaCustomKey]
  }
  
  // If not found, search by team.id field
  const teamById = Object.values(ALL_TEAMS).find(team => team.id === id)
  return teamById || null
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