import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nba from 'nba'
import { z } from 'zod'
import type { Database } from '@/lib/types/database'
import { TeamSchema, PlayerSchema, getCDNUrls, getCurrentSeason, getWNBASeason } from '@/lib/types/nba'

// This endpoint can only be called by Vercel Cron Jobs or with the correct secret
export async function GET(request: NextRequest) {
  try {
    // Security check for cron jobs
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
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
          : teams.resultSets[1].rowSet

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
                id: team[1].toString(),
                name: team[2],
                abbreviation: team[3],
                city: team[2].split(' ').slice(0, -1).join(' '),
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
        return processedTeams.length
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

        return players.map((player: any) => PlayerSchema.parse(player))
      } catch (error) {
        console.error(`Error fetching roster for team ${teamId}:`, error)
        return []
      }
    }

    // Main sync function
    async function runLeague(league: 'NBA' | 'WNBA') {
      console.log(`\n🔄 Starting ${league} sync...`)
      
      // Step 1: Sync teams
      const teamCount = await syncTeams(league)

      // Step 2: Get teams from database
      const { data: teams } = await supabase
        .from('teams')
        .select('id')
        .eq('league', league)

      if (!teams?.length) {
        console.log(`No ${league} teams found in database`)
        return { teams: teamCount, players: 0 }
      }

      let totalPlayers = 0

      // Step 3: Sync rosters for each team
      for (const { id } of teams) {
        console.log(`📋 Syncing roster for team ${id}...`)
        
        const players = await syncRoster(parseInt(id), league)
        
        for (const player of players) {
          // Upsert player to database
          const { error } = await supabase
            .from('players')
            .upsert(player, { onConflict: 'id' })

          if (error) {
            console.error(`Error upserting player ${player.name}:`, error)
          }
        }

        totalPlayers += players.length
        console.log(`✅ Synced ${players.length} players for team ${id}`)
        
        // Rate limiting - wait 1 second between team requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log(`🎉 ${league} sync completed!`)
      return { teams: teamCount, players: totalPlayers }
    }

    // Execute the sync
    console.log('🚀 Starting NBA + WNBA sync...')
    
    const nbaResults = await runLeague('NBA')
    const wnbaResults = await runLeague('WNBA')
    
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      nba: nbaResults,
      wnba: wnbaResults,
      total: {
        teams: nbaResults.teams + wnbaResults.teams,
        players: nbaResults.players + wnbaResults.players
      }
    }
    
    console.log('✅ NBA + WNBA sync completed!', results)
    
    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ Sync failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}