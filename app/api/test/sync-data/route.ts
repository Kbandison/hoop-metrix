import { NextRequest, NextResponse } from 'next/server'

// This is a test endpoint to manually trigger data sync during development
export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const cronSecret = process.env.CRON_SECRET || 'test-secret'
    
    // Call the cron endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/cron/sync-nba-data`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: 'Sync failed', details: data }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Data sync completed successfully',
      data
    })

  } catch (error) {
    console.error('Test sync error:', error)
    
    return NextResponse.json({
      error: 'Test sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}