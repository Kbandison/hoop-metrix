import { NextRequest, NextResponse } from 'next/server'
import { getCurrentNBASeason, getCurrentWNBASeason, getSeasonInfo } from '@/lib/utils/current-season'

/**
 * Production-ready automatic sync that:
 * 1. Dynamically detects current seasons
 * 2. Updates all NBA/WNBA rosters
 * 3. Future-proof for all upcoming seasons
 * 4. Can be run on a schedule (daily/weekly)
 */
export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with proper auth for security
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET
      
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    // Dynamically determine current seasons
    const seasonInfo = getSeasonInfo()
    const nbaSeason = seasonInfo.nba.season
    const wnbaSeason = seasonInfo.wnba.season

    console.log(`🤖 AUTO-SYNC: Starting automatic roster sync`)
    console.log(`📅 NBA Season: ${nbaSeason} (detected: ${seasonInfo.nba.description})`)
    console.log(`📅 WNBA Season: ${wnbaSeason} (detected: ${seasonInfo.wnba.description})`)

    const NBA_HEADERS = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.nba.com/',
      'Accept': 'application/json, text/plain, */*'
    }

    const WNBA_HEADERS = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://stats.wnba.com/',
      'Accept': 'application/json, text/plain, */*'
    }

    async function fetchWithRetry(url: string, headers: any, retries = 3): Promise<any> {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, { 
            headers,
            signal: AbortSignal.timeout(15000)
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          return response.json()
        } catch (error) {
          console.warn(`Attempt ${i + 1} failed:`, error instanceof Error ? error.message : error)
          if (i === retries - 1) throw error
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
        }
      }
    }

    const syncStartTime = Date.now()
    let totalNBAPlayersAdded = 0
    let totalWNBAPlayersAdded = 0
    let nbaErrors = []
    let wnbaErrors = []

    // Get all teams
    const { data: nbaTeams } = await supabase
      .from('teams')
      .select('id, name, city')
      .eq('league', 'NBA')

    const { data: wnbaTeams } = await supabase
      .from('teams')
      .select('id, name, city')
      .eq('league', 'WNBA')

    if (!nbaTeams || !wnbaTeams) {
      throw new Error('No teams found in database')
    }

    console.log(`🏀 Found ${nbaTeams.length} NBA teams and ${wnbaTeams.length} WNBA teams`)

    // Clear existing players
    console.log('🗑️ Clearing existing player data...')
    await Promise.all([
      supabase.from('players').delete().eq('league', 'NBA'),
      supabase.from('players').delete().eq('league', 'WNBA')
    ])

    // Sync NBA teams
    console.log(`🏀 Syncing NBA teams with season ${nbaSeason}...`)
    for (const team of nbaTeams) {
      try {
        const rosterUrl = `https://stats.nba.com/stats/commonteamroster?TeamID=${team.id}&Season=${nbaSeason}`
        const rosterData = await fetchWithRetry(rosterUrl, NBA_HEADERS)
        
        if (rosterData.resultSets?.[0]?.rowSet) {
          const roster = rosterData.resultSets[0]
          const headers = roster.headers
          const players = roster.rowSet

          for (const playerRow of players) {
            const playerData: Record<string, any> = {}
            headers.forEach((header: string, i: number) => {
              playerData[header] = playerRow[i]
            })

            if (playerData.PLAYER_ID && playerData.PLAYER) {
              const player = {
                id: playerData.PLAYER_ID.toString(),
                name: playerData.PLAYER,
                team_id: team.id,
                league: 'NBA' as const,
                position: playerData.POSITION || '',
                jersey_number: playerData.NUM ? parseInt(playerData.NUM) : null,
                height: playerData.HEIGHT || null,
                weight: playerData.WEIGHT || null,
                birth_date: playerData.BIRTH_DATE || null,
                photo_url: `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerData.PLAYER_ID}.png`,
                bio: null,
                season_stats: null,
                career_stats: null,
                is_active: true
              }

              const { error } = await supabase
                .from('players')
                .upsert(player, { onConflict: 'id' })

              if (!error) {
                totalNBAPlayersAdded++
              } else {
                nbaErrors.push(`${player.name}: ${error.message}`)
              }
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500))

      } catch (error) {
        const errorMsg = `${team.name}: ${error instanceof Error ? error.message : error}`
        nbaErrors.push(errorMsg)
      }
    }

    // Sync WNBA teams
    console.log(`🏀 Syncing WNBA teams with season ${wnbaSeason}...`)
    for (const team of wnbaTeams) {
      try {
        const rosterUrl = `https://stats.wnba.com/stats/commonteamroster?LeagueID=10&Season=${wnbaSeason}&TeamID=${team.id}`
        const rosterData = await fetchWithRetry(rosterUrl, WNBA_HEADERS)
        
        if (rosterData.resultSets?.[0]?.rowSet) {
          const roster = rosterData.resultSets[0]
          const headers = roster.headers
          const players = roster.rowSet

          for (const playerRow of players) {
            const playerData: Record<string, any> = {}
            headers.forEach((header: string, i: number) => {
              playerData[header] = playerRow[i]
            })

            if (playerData.PLAYER_ID && playerData.PLAYER) {
              const player = {
                id: playerData.PLAYER_ID.toString(),
                name: playerData.PLAYER,
                team_id: team.id,
                league: 'WNBA' as const,
                position: playerData.POSITION || '',
                jersey_number: playerData.NUM ? parseInt(playerData.NUM) : null,
                height: playerData.HEIGHT || null,
                weight: playerData.WEIGHT || null,
                birth_date: playerData.BIRTH_DATE || null,
                photo_url: `https://cdn.wnba.com/headshots/wnba/latest/1040x760/${playerData.PLAYER_ID}.png`,
                bio: null,
                season_stats: null,
                career_stats: null,
                is_active: true
              }

              const { error } = await supabase
                .from('players')
                .upsert(player, { onConflict: 'id' })

              if (!error) {
                totalWNBAPlayersAdded++
              } else {
                wnbaErrors.push(`${player.name}: ${error.message}`)
              }
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        const errorMsg = `${team.name}: ${error instanceof Error ? error.message : error}`
        wnbaErrors.push(errorMsg)
      }
    }

    const syncDuration = Math.round((Date.now() - syncStartTime) / 1000)

    // Get final counts
    const { count: finalNBAPlayers } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('league', 'NBA')

    const { count: finalWNBAPlayers } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('league', 'WNBA')

    const results = {
      success: true,
      sync_type: 'automatic_future_proof',
      timestamp: new Date().toISOString(),
      duration_seconds: syncDuration,
      season_detection: seasonInfo,
      summary: {
        nba: {
          season_used: nbaSeason,
          teams_processed: nbaTeams.length,
          players_added: totalNBAPlayersAdded,
          final_count: finalNBAPlayers || 0,
          errors: nbaErrors.length
        },
        wnba: {
          season_used: wnbaSeason,
          teams_processed: wnbaTeams.length,
          players_added: totalWNBAPlayersAdded,
          final_count: finalWNBAPlayers || 0,
          errors: wnbaErrors.length
        },
        total: {
          players_synced: totalNBAPlayersAdded + totalWNBAPlayersAdded,
          final_count: (finalNBAPlayers || 0) + (finalWNBAPlayers || 0)
        }
      },
      future_proof_features: {
        automatic_season_detection: true,
        works_for_all_future_seasons: true,
        no_manual_updates_needed: true,
        can_be_scheduled: true
      }
    }

    console.log(`✅ AUTO-SYNC COMPLETE in ${syncDuration}s`)
    console.log(`📊 NBA: ${totalNBAPlayersAdded} players | WNBA: ${totalWNBAPlayersAdded} players`)
    
    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ Auto-sync failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}