// Players Data Index - Centralized player information for easy lookup and management

export interface PlayerData {
  id: string
  name: string
  firstName: string
  lastName: string
  position: string
  jersey_number: number
  team_id: string
  league: 'NBA' | 'WNBA'
  height: string
  weight: string
  age?: number
  birthdate?: string
  birthplace?: string
  college?: string
  experience?: number
  photo_url: string
  season_stats?: {
    pts: number
    reb: number
    ast: number
    fg_pct?: number
    ft_pct?: number
    three_pt_pct?: number
    stl?: number
    blk?: number
    to?: number
  }
  career_stats?: {
    games_played: number
    pts_avg: number
    reb_avg: number
    ast_avg: number
    fg_pct: number
  }
  awards?: string[]
  social?: {
    twitter?: string
    instagram?: string
  }
}

// NBA Players Index
export const NBA_PLAYERS: Record<string, PlayerData> = {
  "lebron-james": {
    id: "lebron-james",
    name: "LeBron James",
    firstName: "LeBron",
    lastName: "James",
    position: "SF",
    jersey_number: 23,
    team_id: "lakers",
    league: "NBA",
    height: "6'9\"",
    weight: "250 lbs",
    age: 39,
    birthdate: "1984-12-30",
    birthplace: "Akron, Ohio",
    college: "None (High School)",
    experience: 21,
    photo_url: "/Damien Daniels Hoop Metrix.jpg",
    season_stats: { pts: 25.3, reb: 7.3, ast: 7.4, fg_pct: 54.0, ft_pct: 69.5, three_pt_pct: 40.6 },
    career_stats: { games_played: 1421, pts_avg: 27.2, reb_avg: 7.5, ast_avg: 7.3, fg_pct: 50.5 },
    awards: ["4× NBA Champion", "4× NBA Finals MVP", "4× NBA MVP", "19× NBA All-Star"],
    social: { twitter: "@KingJames", instagram: "@kingjames" }
  },
  "stephen-curry": {
    id: "stephen-curry",
    name: "Stephen Curry",
    firstName: "Stephen",
    lastName: "Curry",
    position: "PG",
    jersey_number: 30,
    team_id: "warriors",
    league: "NBA",
    height: "6'2\"",
    weight: "185 lbs",
    age: 35,
    birthdate: "1988-03-14",
    birthplace: "Akron, Ohio",
    college: "Davidson College",
    experience: 15,
    photo_url: "/Justice Brantley Hoop Metrix.jpg",
    season_stats: { pts: 26.4, reb: 4.5, ast: 5.1, fg_pct: 45.0, ft_pct: 91.5, three_pt_pct: 40.8 },
    career_stats: { games_played: 826, pts_avg: 24.6, reb_avg: 4.7, ast_avg: 6.5, fg_pct: 47.3 },
    awards: ["4× NBA Champion", "2× NBA MVP", "9× NBA All-Star", "NBA Finals MVP"],
    social: { twitter: "@StephenCurry30", instagram: "@stephencurry30" }
  },
  "anthony-davis": {
    id: "anthony-davis",
    name: "Anthony Davis",
    firstName: "Anthony",
    lastName: "Davis",
    position: "PF",
    jersey_number: 3,
    team_id: "lakers",
    league: "NBA",
    height: "6'10\"",
    weight: "253 lbs",
    age: 31,
    birthdate: "1993-03-11",
    birthplace: "Chicago, Illinois",
    college: "University of Kentucky",
    experience: 12,
    photo_url: "/Damien Daniels 2 Hoop Metrix.jpg",
    season_stats: { pts: 24.7, reb: 12.6, ast: 3.5, fg_pct: 56.3, ft_pct: 81.6 },
    career_stats: { games_played: 656, pts_avg: 24.0, reb_avg: 10.4, ast_avg: 2.4, fg_pct: 53.5 },
    awards: ["NBA Champion", "8× NBA All-Star", "4× All-NBA First Team"]
  },
  "dangelo-russell": {
    id: "dangelo-russell",
    name: "D'Angelo Russell",
    firstName: "D'Angelo",
    lastName: "Russell",
    position: "PG",
    jersey_number: 1,
    team_id: "lakers",
    league: "NBA",
    height: "6'4\"",
    weight: "193 lbs",
    age: 28,
    birthdate: "1996-02-23",
    birthplace: "Louisville, Kentucky",
    college: "Ohio State University",
    experience: 9,
    photo_url: "/RJ mcGee 2 Hoop Metrix.jpg",
    season_stats: { pts: 18.0, reb: 3.1, ast: 6.3, fg_pct: 45.6, three_pt_pct: 41.5 },
    career_stats: { games_played: 507, pts_avg: 17.3, reb_avg: 3.7, ast_avg: 5.7, fg_pct: 43.4 },
    awards: ["NBA All-Star"]
  },
  "austin-reaves": {
    id: "austin-reaves",
    name: "Austin Reaves",
    firstName: "Austin",
    lastName: "Reaves",
    position: "SG",
    jersey_number: 15,
    team_id: "lakers",
    league: "NBA",
    height: "6'5\"",
    weight: "197 lbs",
    age: 26,
    birthdate: "1998-05-29",
    birthplace: "Newark, Arkansas",
    college: "University of Oklahoma",
    experience: 3,
    photo_url: "/Seth Compas 22 Hoope Metrix.jpg",
    season_stats: { pts: 15.9, reb: 4.3, ast: 5.5, fg_pct: 48.6, three_pt_pct: 36.7 },
    career_stats: { games_played: 183, pts_avg: 11.9, reb_avg: 3.4, ast_avg: 3.4, fg_pct: 46.6 },
    awards: []
  }
}

// WNBA Players Index
export const WNBA_PLAYERS: Record<string, PlayerData> = {
  "aja-wilson": {
    id: "aja-wilson",
    name: "A'ja Wilson",
    firstName: "A'ja",
    lastName: "Wilson",
    position: "F",
    jersey_number: 22,
    team_id: "aces",
    league: "WNBA",
    height: "6'4\"",
    weight: "195 lbs",
    age: 27,
    birthdate: "1996-08-08",
    birthplace: "Hopkins, South Carolina",
    college: "University of South Carolina",
    experience: 6,
    photo_url: "/RJ McGee Hoop Metrix.jpg",
    season_stats: { pts: 22.8, reb: 9.4, ast: 2.3, fg_pct: 51.1, ft_pct: 82.2 },
    career_stats: { games_played: 201, pts_avg: 19.1, reb_avg: 8.9, ast_avg: 2.1, fg_pct: 49.8 },
    awards: ["2× WNBA Champion", "2× WNBA MVP", "5× WNBA All-Star", "WNBA Rookie of the Year"],
    social: { twitter: "@_ajawilson22", instagram: "@_ajawilson22" }
  },
  "breanna-stewart": {
    id: "breanna-stewart",
    name: "Breanna Stewart",
    firstName: "Breanna",
    lastName: "Stewart",
    position: "F",
    jersey_number: 30,
    team_id: "liberty",
    league: "WNBA",
    height: "6'4\"",
    weight: "170 lbs",
    age: 29,
    birthdate: "1994-08-27",
    birthplace: "Syracuse, New York",
    college: "University of Connecticut",
    experience: 7,
    photo_url: "/Seth Compas Hoop Metrix.jpg",
    season_stats: { pts: 23.0, reb: 9.3, ast: 3.8, fg_pct: 45.9, three_pt_pct: 38.5 },
    career_stats: { games_played: 237, pts_avg: 19.9, reb_avg: 8.3, ast_avg: 2.9, fg_pct: 45.0 },
    awards: ["2× WNBA Champion", "2× WNBA Finals MVP", "2× WNBA MVP", "5× WNBA All-Star"],
    social: { twitter: "@breannastewart", instagram: "@breannastewart" }
  },
  "kelsey-plum": {
    id: "kelsey-plum",
    name: "Kelsey Plum",
    firstName: "Kelsey",
    lastName: "Plum",
    position: "G",
    jersey_number: 10,
    team_id: "aces",
    league: "WNBA",
    height: "5'8\"",
    weight: "145 lbs",
    age: 29,
    birthdate: "1994-08-24",
    birthplace: "Poway, California",
    college: "University of Washington",
    experience: 7,
    photo_url: "/placeholder-player.svg",
    season_stats: { pts: 17.8, reb: 2.6, ast: 4.2, fg_pct: 43.5, three_pt_pct: 37.9 },
    career_stats: { games_played: 203, pts_avg: 15.3, reb_avg: 2.5, ast_avg: 3.8, fg_pct: 43.1 },
    awards: ["2× WNBA Champion", "WNBA All-Star"],
    social: { twitter: "@kelseyplum10", instagram: "@kelseyplum10" }
  },
  "sabrina-ionescu": {
    id: "sabrina-ionescu",
    name: "Sabrina Ionescu",
    firstName: "Sabrina",
    lastName: "Ionescu",
    position: "G",
    jersey_number: 20,
    team_id: "liberty",
    league: "WNBA",
    height: "5'11\"",
    weight: "165 lbs",
    age: 26,
    birthdate: "1997-12-06",
    birthplace: "Walnut Creek, California",
    college: "University of Oregon",
    experience: 4,
    photo_url: "/placeholder-player.svg",
    season_stats: { pts: 19.7, reb: 4.4, ast: 6.2, fg_pct: 46.3, three_pt_pct: 44.3 },
    career_stats: { games_played: 117, pts_avg: 17.9, reb_avg: 4.8, ast_avg: 6.1, fg_pct: 43.2 },
    awards: ["2× WNBA All-Star", "WNBA Rookie of the Year"],
    social: { twitter: "@sabrina_i20", instagram: "@sabrina_i" }
  }
}

// Team Rosters Index - Maps teams to their players
export const TEAM_ROSTERS: Record<string, string[]> = {
  lakers: ["lebron-james", "anthony-davis", "dangelo-russell", "austin-reaves"],
  warriors: ["stephen-curry"],
  aces: ["aja-wilson", "kelsey-plum"],
  liberty: ["breanna-stewart", "sabrina-ionescu"]
}

// Combined Players Index
export const ALL_PLAYERS: Record<string, PlayerData> = {
  ...NBA_PLAYERS,
  ...WNBA_PLAYERS
}

// Utility functions for player data lookup
export const getPlayerById = (id: string): PlayerData | null => {
  return ALL_PLAYERS[id] || null
}

export const getPlayersByTeam = (teamId: string): PlayerData[] => {
  return Object.values(ALL_PLAYERS).filter(player => player.team_id === teamId)
}

export const getPlayersByLeague = (league: 'NBA' | 'WNBA'): PlayerData[] => {
  return Object.values(ALL_PLAYERS).filter(player => player.league === league)
}

export const getPlayersByPosition = (position: string): PlayerData[] => {
  return Object.values(ALL_PLAYERS).filter(player => player.position === position)
}

export const searchPlayers = (query: string): PlayerData[] => {
  const searchTerm = query.toLowerCase()
  return Object.values(ALL_PLAYERS).filter(player => 
    player.name.toLowerCase().includes(searchTerm) ||
    player.firstName.toLowerCase().includes(searchTerm) ||
    player.lastName.toLowerCase().includes(searchTerm) ||
    player.position.toLowerCase().includes(searchTerm) ||
    player.college?.toLowerCase().includes(searchTerm)
  )
}

export const getTopScorers = (league?: 'NBA' | 'WNBA', limit: number = 10): PlayerData[] => {
  let players = Object.values(ALL_PLAYERS)
  if (league) {
    players = players.filter(player => player.league === league)
  }
  return players
    .filter(player => player.season_stats?.pts)
    .sort((a, b) => (b.season_stats!.pts) - (a.season_stats!.pts))
    .slice(0, limit)
}

// Position mappings and constants
export const POSITIONS = {
  NBA: ['PG', 'SG', 'SF', 'PF', 'C'],
  WNBA: ['G', 'F', 'C'],
  ALL: ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F']
}

export const POSITION_NAMES = {
  'PG': 'Point Guard',
  'SG': 'Shooting Guard', 
  'SF': 'Small Forward',
  'PF': 'Power Forward',
  'C': 'Center',
  'G': 'Guard',
  'F': 'Forward'
}

// Player statistics
export const PLAYER_STATS = {
  totalPlayers: Object.keys(ALL_PLAYERS).length,
  nbaPlayers: Object.keys(NBA_PLAYERS).length,
  wnbaPlayers: Object.keys(WNBA_PLAYERS).length,
  averageAge: Math.round(
    Object.values(ALL_PLAYERS)
      .filter(player => player.age)
      .reduce((sum, player) => sum + (player.age || 0), 0) / 
    Object.values(ALL_PLAYERS).filter(player => player.age).length
  ),
  topScorer: Object.values(ALL_PLAYERS)
    .filter(player => player.season_stats?.pts)
    .sort((a, b) => (b.season_stats!.pts) - (a.season_stats!.pts))[0],
  mostExperienced: Object.values(ALL_PLAYERS)
    .filter(player => player.experience)
    .sort((a, b) => (b.experience || 0) - (a.experience || 0))[0]
}