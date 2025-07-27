import { NextRequest, NextResponse } from 'next/server'

/**
 * Vercel Cron Job endpoint for daily roster sync
 * This endpoint will be called automatically by Vercel cron
 * 
 * To set up in Vercel:
 * 1. Add to vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/daily-roster-sync",
 *       "schedule": "0 6 * * *"
 *     }
 *   ]
 * }
 * 
 * This runs daily at 6 AM UTC (2 AM EST / 11 PM PST)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron call
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🤖 CRON: Starting daily roster sync...')

    // Call our production auto-sync endpoint
    const syncUrl = new URL('/api/sync/production-auto', request.url)
    const syncResponse = await fetch(syncUrl.toString(), {
      headers: {
        'authorization': `Bearer ${cronSecret}`
      }
    })

    if (!syncResponse.ok) {
      throw new Error(`Sync failed: ${syncResponse.status} ${syncResponse.statusText}`)
    }

    const syncResult = await syncResponse.json()

    const cronResult = {
      success: true,
      cron_job: 'daily-roster-sync',
      executed_at: new Date().toISOString(),
      sync_result: syncResult,
      next_scheduled_run: 'Tomorrow at 6 AM UTC',
      note: 'Automatic daily sync keeps rosters current for all future seasons'
    }

    console.log('✅ CRON: Daily roster sync completed successfully')
    
    return NextResponse.json(cronResult)

  } catch (error) {
    console.error('❌ CRON: Daily roster sync failed:', error)
    
    const errorResult = {
      success: false,
      cron_job: 'daily-roster-sync',
      executed_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      note: 'Cron job failed - manual intervention may be needed'
    }
    
    return NextResponse.json(errorResult, { status: 500 })
  }
}