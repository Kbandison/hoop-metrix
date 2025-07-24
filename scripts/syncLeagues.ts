#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js'
import nba from 'nba'
import fetch from 'node-fetch'
import { z } from 'zod'
import dotenv from 'dotenv'
import type { Database } from '../lib/types/database'
import { TeamSchema, PlayerSchema, getCDNUrls, getCurrentSeason, getWNBASeason } from '../lib/types/nba'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// NBA headers for API requests
const NBA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Referer': 'https://stats.nba.com/',
  'Origin': 'https://www.nba.com',
  'x-nba-stats-origin': 'stats',
  'x-nba-stats-token': 'true',
}

// Fetch function with proper headers
async function nbaFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: NBA_HEADERS })
  if (!res.ok) {
    throw new Error(`NBA API ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// Sync teams for a league
async function syncTeams(league: 'NBA' | 'WNBA') {
  console.log(`🏀 Syncing ${league} teams...`)
  
  try {
    const teams = league === 'NBA' 
      ? await nba.data.teams()
      : await nbaFetch<any>(`https://stats.wnba.com/stats/leaguegamelog?Season=2025&SeasonType=Regular+Season`)

    const teamList = league === 'NBA' 
      ? teams 
      : teams.resultSets[1].rowSet // WNBA team data structure

    const processedTeams = teamList.map((team: any) => {
      const teamData = league === 'NBA' 
        ? {
            id: team.teamId.toString(),
            name: team.fullName,
            abbreviation: team.tricode,
            city: team.city,
            league,
            logo_url: getCDNUrls.teamLogo(league, team.teamId.toString()),
            conference: team.confName || null,
            division: team.divName || null,
          }
        : {
            id: team[1].toString(), // TEAM_ID
            name: team[2], // TEAM_NAME
            abbreviation: team[3], // TEAM_ABBREVIATION
            city: team[2].split(' ').slice(0, -1).join(' '), // Extract city from team name
            league,
            logo_url: getCDNUrls.teamLogo(league, team[1].toString()),
            conference: null,
            division: null,
          }

      return TeamSchema.parse(teamData)
    })

    // Upsert teams to database
    for (const team of processedTeams) {
      const { error } = await supabase
        .from('teams')
        .upsert(team, { onConflict: 'id' })

      if (error) {
        console.error(`Error upserting team ${team.name}:`, error)
      }
    }

    console.log(`✅ Synced ${processedTeams.length} ${league} teams`)
    return processedTeams
  } catch (error) {
    console.error(`❌ Error syncing ${league} teams:`, error)
    throw error
  }
}

// Sync roster for a team
async function syncRoster(teamId: number, league: 'NBA' | 'WNBA') {
  const season = league === 'NBA' ? getCurrentSeason() : getWNBASeason()
  
  try {
    const endpoint = league === 'NBA'
      ? `https://stats.nba.com/stats/commonteamroster?TeamID=${teamId}&Season=${season}`
      : `https://stats.wnba.com/stats/commonteamroster?TeamID=${teamId}&Season=${season}`

    const res = await nbaFetch<any>(endpoint)
    const { headers, rowSet } = res.resultSets[0]

    const players = rowSet.map((row: any[]) => {
      const playerData: Record<string, any> = {}
      headers.forEach((header: string, i: number) => {
        playerData[header] = row[i]
      })

      return {
        id: playerData.PLAYER_ID.toString(),
        name: playerData.PLAYER,
        team_id: teamId.toString(),
        league,
        position: playerData.POSITION || '',
        jersey_number: playerData.NUM ? parseInt(playerData.NUM) : null,
        height: playerData.HEIGHT || null,
        weight: playerData.WEIGHT || null,
        photo_url: getCDNUrls.playerHeadshot(league, playerData.PLAYER_ID.toString()),
        is_active: true,
      }
    })

    return players.map(player => PlayerSchema.parse(player))
  } catch (error) {
    console.error(`Error fetching roster for team ${teamId}:`, error)
    return []
  }
}

// Sync season stats for a player
async function syncSeasonStats(playerId: number, league: 'NBA' | 'WNBA') {
  const season = league === 'NBA' ? getCurrentSeason() : getWNBASeason()
  
  try {
    const endpoint = league === 'NBA'
      ? `https://stats.nba.com/stats/playercareerstats`
      : `https://stats.wnba.com/stats/playercareerstats`

    const base = `${endpoint}?PerMode=PerGame&PlayerID=${playerId}`
    const url = league === 'NBA' ? base : `${base}&Season=${season}`

    const res = await nbaFetch<any>(url)
    const { headers, rowSet } = res.resultSets.find(
      (rs: any) => rs.name === 'SeasonTotalsRegularSeason'
    )

    // Get the latest season row
    const last = rowSet[rowSet.length - 1]
    if (!last) return {}

    const obj: Record<string, any> = {}
    headers.forEach((h: string, i: number) => {
      obj[h] = last[i]
    })

    return {
      player_id: playerId,
      season: obj.SEASON_ID,
      gp: obj.GP,
      pts: obj.PTS,
      reb: obj.REB,
      ast: obj.AST,
      fg_pct: obj.FG_PCT,
      three_pct: obj.FG3_PCT,
    }
  } catch (error) {
    console.error(`Error fetching stats for player ${playerId}:`, error)
    return {}
  }
}

// Main sync function
async function runLeague(league: 'NBA' | 'WNBA') {
  console.log(`\n🔄 Starting ${league} sync...`)
  
  // Step 1: Sync teams
  await syncTeams(league)

  // Step 2: Get teams from database
  const { data: teams } = await supabase
    .from('teams')
    .select('id')
    .eq('league', league)

  if (!teams?.length) {
    console.log(`No ${league} teams found in database`)
    return
  }

  // Step 3: Sync rosters for each team
  for (const { id } of teams) {
    console.log(`📋 Syncing roster for team ${id}...`)
    
    const players = await syncRoster(parseInt(id), league)
    
    for (const player of players) {
      // Get season stats
      const seasonStats = await syncSeasonStats(parseInt(player.id), league)
      
      const playerWithStats = {
        ...player,
        season_stats: seasonStats,
      }

      // Upsert player to database
      const { error } = await supabase
        .from('players')
        .upsert(playerWithStats, { onConflict: 'id' })

      if (error) {
        console.error(`Error upserting player ${player.name}:`, error)
      }
    }

    console.log(`✅ Synced ${players.length} players for team ${id}`)
    
    // Rate limiting - wait 1 second between team requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`🎉 ${league} sync completed!`)
}

// Execute the sync
(async () => {
  try {
    console.log('🚀 Starting NBA + WNBA sync...')
    
    await runLeague('NBA')
    await runLeague('WNBA')
    
    console.log('✅ NBA + WNBA sync completed!')
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }
})()