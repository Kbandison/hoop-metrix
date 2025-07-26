import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

// Enable fetch polyfill for server environment
if (typeof globalThis.fetch === 'undefined') {
  const nodeFetch = require('node-fetch')
  globalThis.fetch = nodeFetch
  globalThis.Headers = nodeFetch.Headers
  globalThis.Request = nodeFetch.Request
  globalThis.Response = nodeFetch.Response
}

// This endpoint performs full NBA/WNBA data synchronization
export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET
      
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    console.log('🚀 Starting full NBA/WNBA data sync...')

    // NBA headers for API requests
    const NBA_HEADERS = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.nba.com/',
      'Origin': 'https://www.nba.com',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }

    // Enhanced fetch function with retries
    async function fetchWithRetry(url: string, retries = 3): Promise<any> {
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Fetching: ${url} (attempt ${i + 1})`)
          const response = await fetch(url, { 
            headers: NBA_HEADERS,
            signal: AbortSignal.timeout(10000)
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const data = await response.json()
          return data
        } catch (error) {
          console.warn(`Attempt ${i + 1} failed:`, error instanceof Error ? error.message : error)
          if (i === retries - 1) throw error
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
        }
      }
    }

    // Sync NBA teams using simplified approach
    async function syncNBATeams() {
      console.log('🏀 Syncing NBA teams...')
      
      // Use a more reliable NBA teams endpoint
      const teamsUrl = 'https://stats.nba.com/stats/leaguestandingsv3?LeagueID=00&Season=2024-25&SeasonType=Regular+Season'
      
      try {
        const data = await fetchWithRetry(teamsUrl)
        const standings = data.resultSets[0]?.rowSet || []
        
        if (standings.length === 0) {
          // Fallback to hardcoded NBA teams if API fails
          return await insertHardcodedNBATeams()
        }
        
        const teams = standings.map((team: any[]) => ({
          id: team[2].toString(), // TeamID
          name: team[4], // TeamName
          abbreviation: team[5], // TeamAbbreviation
          city: team[3], // TeamCity
          league: 'NBA' as const,
          logo_url: `https://cdn.nba.com/logos/nba/${team[2]}/primary/L/logo.svg`,
          conference: team[6], // Conference
          division: team[7], // Division
          primary_color: null,
          secondary_color: null
        }))

        let insertedCount = 0
        for (const team of teams) {
          const { error } = await supabase
            .from('teams')
            .upsert(team, { onConflict: 'id' })
          
          if (!error) {
            insertedCount++
            console.log(`✅ NBA Team: ${team.name}`)
          } else {
            console.error(`❌ Error inserting ${team.name}:`, error)
          }
        }
        
        return insertedCount
      } catch (error) {
        console.error('NBA teams API failed, using hardcoded data:', error)
        return await insertHardcodedNBATeams()
      }
    }

    // Fallback hardcoded NBA teams
    async function insertHardcodedNBATeams() {
      console.log('📦 Using hardcoded NBA teams...')
      
      const nbaTeams = [
        { id: '1610612737', name: 'Atlanta Hawks', abbrev: 'ATL', city: 'Atlanta', conf: 'East', div: 'Southeast' },
        { id: '1610612738', name: 'Boston Celtics', abbrev: 'BOS', city: 'Boston', conf: 'East', div: 'Atlantic' },
        { id: '1610612751', name: 'Brooklyn Nets', abbrev: 'BKN', city: 'Brooklyn', conf: 'East', div: 'Atlantic' },
        { id: '1610612766', name: 'Charlotte Hornets', abbrev: 'CHA', city: 'Charlotte', conf: 'East', div: 'Southeast' },
        { id: '1610612741', name: 'Chicago Bulls', abbrev: 'CHI', city: 'Chicago', conf: 'East', div: 'Central' },
        { id: '1610612739', name: 'Cleveland Cavaliers', abbrev: 'CLE', city: 'Cleveland', conf: 'East', div: 'Central' },
        { id: '1610612742', name: 'Dallas Mavericks', abbrev: 'DAL', city: 'Dallas', conf: 'West', div: 'Southwest' },
        { id: '1610612743', name: 'Denver Nuggets', abbrev: 'DEN', city: 'Denver', conf: 'West', div: 'Northwest' },
        { id: '1610612765', name: 'Detroit Pistons', abbrev: 'DET', city: 'Detroit', conf: 'East', div: 'Central' },
        { id: '1610612744', name: 'Golden State Warriors', abbrev: 'GSW', city: 'Golden State', conf: 'West', div: 'Pacific' },
        { id: '1610612745', name: 'Houston Rockets', abbrev: 'HOU', city: 'Houston', conf: 'West', div: 'Southwest' },
        { id: '1610612754', name: 'Indiana Pacers', abbrev: 'IND', city: 'Indiana', conf: 'East', div: 'Central' },
        { id: '1610612746', name: 'LA Clippers', abbrev: 'LAC', city: 'Los Angeles', conf: 'West', div: 'Pacific' },
        { id: '1610612747', name: 'Los Angeles Lakers', abbrev: 'LAL', city: 'Los Angeles', conf: 'West', div: 'Pacific' },
        { id: '1610612763', name: 'Memphis Grizzlies', abbrev: 'MEM', city: 'Memphis', conf: 'West', div: 'Southwest' },
        { id: '1610612748', name: 'Miami Heat', abbrev: 'MIA', city: 'Miami', conf: 'East', div: 'Southeast' },
        { id: '1610612749', name: 'Milwaukee Bucks', abbrev: 'MIL', city: 'Milwaukee', conf: 'East', div: 'Central' },
        { id: '1610612750', name: 'Minnesota Timberwolves', abbrev: 'MIN', city: 'Minnesota', conf: 'West', div: 'Northwest' },
        { id: '1610612740', name: 'New Orleans Pelicans', abbrev: 'NOP', city: 'New Orleans', conf: 'West', div: 'Southwest' },
        { id: '1610612752', name: 'New York Knicks', abbrev: 'NYK', city: 'New York', conf: 'East', div: 'Atlantic' },
        { id: '1610612760', name: 'Oklahoma City Thunder', abbrev: 'OKC', city: 'Oklahoma City', conf: 'West', div: 'Northwest' },
        { id: '1610612753', name: 'Orlando Magic', abbrev: 'ORL', city: 'Orlando', conf: 'East', div: 'Southeast' },
        { id: '1610612755', name: 'Philadelphia 76ers', abbrev: 'PHI', city: 'Philadelphia', conf: 'East', div: 'Atlantic' },
        { id: '1610612756', name: 'Phoenix Suns', abbrev: 'PHX', city: 'Phoenix', conf: 'West', div: 'Pacific' },
        { id: '1610612757', name: 'Portland Trail Blazers', abbrev: 'POR', city: 'Portland', conf: 'West', div: 'Northwest' },
        { id: '1610612758', name: 'Sacramento Kings', abbrev: 'SAC', city: 'Sacramento', conf: 'West', div: 'Pacific' },
        { id: '1610612759', name: 'San Antonio Spurs', abbrev: 'SAS', city: 'San Antonio', conf: 'West', div: 'Southwest' },
        { id: '1610612761', name: 'Toronto Raptors', abbrev: 'TOR', city: 'Toronto', conf: 'East', div: 'Atlantic' },
        { id: '1610612762', name: 'Utah Jazz', abbrev: 'UTA', city: 'Utah', conf: 'West', div: 'Northwest' },
        { id: '1610612764', name: 'Washington Wizards', abbrev: 'WAS', city: 'Washington', conf: 'East', div: 'Southeast' }
      ]
      
      let insertedCount = 0
      for (const teamData of nbaTeams) {
        const team = {
          id: teamData.id,
          name: teamData.name,
          abbreviation: teamData.abbrev,
          city: teamData.city,
          league: 'NBA' as const,
          logo_url: `https://cdn.nba.com/logos/nba/${teamData.id}/primary/L/logo.svg`,
          conference: teamData.conf,
          division: teamData.div,
          primary_color: null,
          secondary_color: null
        }
        
        const { error } = await supabase
          .from('teams')
          .upsert(team, { onConflict: 'id' })
        
        if (!error) {
          insertedCount++
          console.log(`✅ NBA Team: ${team.name}`)
        }
      }
      
      return insertedCount
    }

    // Sync WNBA teams
    async function syncWNBATeams() {
      console.log('🏀 Syncing WNBA teams...')
      
      // Hardcoded WNBA teams (more reliable than API)
      const wnbaTeams = [
        { id: '1611661313', name: 'Atlanta Dream', abbrev: 'ATL', city: 'Atlanta' },
        { id: '1611661314', name: 'Las Vegas Aces', abbrev: 'LVA', city: 'Las Vegas' },
        { id: '1611661315', name: 'Chicago Sky', abbrev: 'CHI', city: 'Chicago' },
        { id: '1611661316', name: 'New York Liberty', abbrev: 'NY', city: 'New York' },
        { id: '1611661317', name: 'Indiana Fever', abbrev: 'IND', city: 'Indiana' },
        { id: '1611661318', name: 'Connecticut Sun', abbrev: 'CONN', city: 'Connecticut' },
        { id: '1611661319', name: 'Washington Mystics', abbrev: 'WAS', city: 'Washington' },
        { id: '1611661320', name: 'Minnesota Lynx', abbrev: 'MIN', city: 'Minnesota' },
        { id: '1611661321', name: 'Phoenix Mercury', abbrev: 'PHX', city: 'Phoenix' },
        { id: '1611661322', name: 'Seattle Storm', abbrev: 'SEA', city: 'Seattle' },
        { id: '1611661313', name: 'Dallas Wings', abbrev: 'DAL', city: 'Dallas' }
      ]
      
      let insertedCount = 0
      for (const teamData of wnbaTeams) {
        const team = {
          id: teamData.id,
          name: teamData.name,
          abbreviation: teamData.abbrev,
          city: teamData.city,
          league: 'WNBA' as const,
          logo_url: `https://cdn.wnba.com/logos/wnba/${teamData.id}/primary/L/logo.svg`,
          conference: 'WNBA',
          division: null,
          primary_color: null,
          secondary_color: null
        }
        
        const { error } = await supabase
          .from('teams')
          .upsert(team, { onConflict: 'id' })
        
        if (!error) {
          insertedCount++
          console.log(`✅ WNBA Team: ${team.name}`)
        }
      }
      
      return insertedCount
    }

    // Sync players for a team (simplified approach)
    async function syncTeamPlayers(teamId: string, league: 'NBA' | 'WNBA') {
      console.log(`👥 Syncing ${league} players for team ${teamId}...`)
      
      try {
        const season = league === 'NBA' ? '2024-25' : '2024'
        const rosterUrl = league === 'NBA' 
          ? `https://stats.nba.com/stats/commonteamroster?TeamID=${teamId}&Season=${season}`
          : `https://stats.wnba.com/stats/commonteamroster?TeamID=${teamId}&Season=${season}`
        
        const data = await fetchWithRetry(rosterUrl)
        const roster = data.resultSets[0]
        
        if (!roster || !roster.rowSet) {
          console.log(`No roster data found for team ${teamId}`)
          return 0
        }
        
        const headers = roster.headers
        const players = roster.rowSet.map((row: any[]) => {
          const playerData: Record<string, any> = {}
          headers.forEach((header: string, i: number) => {
            playerData[header] = row[i]
          })
          
          return {
            id: playerData.PLAYER_ID?.toString() || Math.random().toString(),
            name: playerData.PLAYER || 'Unknown Player',
            team_id: teamId,
            league,
            position: playerData.POSITION || '',
            jersey_number: playerData.NUM ? parseInt(playerData.NUM) : null,
            height: playerData.HEIGHT || null,
            weight: playerData.WEIGHT || null,
            birth_date: null,
            photo_url: `https://cdn.${league.toLowerCase()}.com/headshots/${league.toLowerCase()}/latest/1040x760/${playerData.PLAYER_ID}.png`,
            bio: null,
            season_stats: null,
            career_stats: null,
            is_active: true
          }
        })
        
        let insertedCount = 0
        for (const player of players) {
          const { error } = await supabase
            .from('players')
            .upsert(player, { onConflict: 'id' })
          
          if (!error) {
            insertedCount++
            console.log(`✅ ${league} Player: ${player.name}`)
          } else {
            console.warn(`⚠️ Error inserting ${player.name}:`, error.message)
          }
        }
        
        return insertedCount
      } catch (error) {
        console.error(`Error syncing players for team ${teamId}:`, error)
        return 0
      }
    }

    // Execute the full sync
    console.log('🔄 Step 1: Syncing teams...')
    const nbaTeamCount = await syncNBATeams()
    const wnbaTeamCount = await syncWNBATeams()
    
    console.log('🔄 Step 2: Getting teams from database...')
    const { data: allTeams } = await supabase
      .from('teams')
      .select('id, league')
    
    if (!allTeams) {
      throw new Error('No teams found in database')
    }
    
    console.log('🔄 Step 3: Syncing players for each team...')
    let totalNBAPlayers = 0
    let totalWNBAPlayers = 0
    
    // Sync players for each team with rate limiting
    for (const team of allTeams) {
      const playerCount = await syncTeamPlayers(team.id, team.league as 'NBA' | 'WNBA')
      
      if (team.league === 'NBA') {
        totalNBAPlayers += playerCount
      } else {
        totalWNBAPlayers += playerCount
      }
      
      // Rate limiting - wait 2 seconds between team requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        nba: {
          teams: nbaTeamCount,
          players: totalNBAPlayers
        },
        wnba: {
          teams: wnbaTeamCount,
          players: totalWNBAPlayers
        },
        total: {
          teams: nbaTeamCount + wnbaTeamCount,
          players: totalNBAPlayers + totalWNBAPlayers
        }
      }
    }
    
    console.log('✅ Full NBA + WNBA sync completed!', results.summary)
    
    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ Full sync failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}