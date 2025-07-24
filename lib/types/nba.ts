import { z } from 'zod'

// Zod schemas for validation
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  city: z.string(),
  league: z.enum(['NBA', 'WNBA']),
  logo_url: z.string(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  conference: z.string().optional(),
  division: z.string().optional(),
})

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  team_id: z.string(),
  league: z.enum(['NBA', 'WNBA']),
  position: z.string(),
  jersey_number: z.number().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  birth_date: z.string().optional(),
  photo_url: z.string(),
  bio: z.string().optional(),
  season_stats: z.record(z.string(), z.any()).optional(),
  career_stats: z.record(z.string(), z.any()).optional(),
  is_active: z.boolean().default(true),
})

export const PlayerStatsSchema = z.object({
  player_id: z.string(),
  season: z.string(),
  games_played: z.number(),
  points: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  field_goal_percentage: z.number(),
  three_point_percentage: z.number(),
  free_throw_percentage: z.number(),
})

// TypeScript types derived from schemas
export type Team = z.infer<typeof TeamSchema>
export type Player = z.infer<typeof PlayerSchema>
export type PlayerStats = z.infer<typeof PlayerStatsSchema>

// NBA API response types
export interface NBAApiTeam {
  teamId: number
  fullName: string
  tricode: string
  city: string
  nickname: string
  confName?: string
  divName?: string
}

export interface NBAApiPlayer {
  personId: number
  firstName: string
  lastName: string
  teamId: number
  jersey?: string
  pos?: string
  heightFeet?: number
  heightInches?: number
  weightPounds?: number
  dateOfBirthUTC?: string
  isActive: boolean
}

export interface WNBAApiPlayer {
  PLAYER_ID: number
  PLAYER_NAME: string
  TEAM_ID: number
  TEAM_ABBREVIATION: string
  JERSEY_NUMBER?: string
  POSITION?: string
  HEIGHT?: string
  WEIGHT?: string
  SEASON_ID: string
}

// CDN URL generators
export const getCDNUrls = {
  teamLogo: (league: 'NBA' | 'WNBA', teamId: string) => 
    `https://cdn.nba.com/logos/${league.toLowerCase()}/${teamId}/primary/L/logo.svg`,
  
  playerHeadshot: (league: 'NBA' | 'WNBA', playerId: string) => 
    `https://cdn.nba.com/headshots/${league.toLowerCase()}/latest/260x190/${playerId}.png`,
  
  teamLogoFallback: (league: 'NBA' | 'WNBA', teamId: string) => 
    `https://cdn.nba.com/logos/${league.toLowerCase()}/${teamId}/global/L/logo.svg`,
}

// Season helpers
export const getCurrentSeason = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // getMonth() is 0-indexed
  
  // NBA/WNBA season starts in October, so if we're before October, 
  // we're still in the previous season
  if (month < 10) {
    return `${year - 1}-${year.toString().slice(-2)}`
  } else {
    return `${year}-${(year + 1).toString().slice(-2)}`
  }
}

export const getWNBASeason = () => {
  const year = new Date().getFullYear()
  return year.toString()
}