import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Test admin endpoint called')
    
    // Just return success without any auth checks
    return NextResponse.json({ 
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test admin endpoint error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}