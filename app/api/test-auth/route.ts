import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Test Auth - Auth Error:', authError)
    console.log('Test Auth - User:', user?.id, user?.email)
    
    if (authError) {
      return NextResponse.json({ 
        error: 'Auth error', 
        details: authError,
        authenticated: false 
      }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No user found',
        authenticated: false 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Test Auth error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error,
      authenticated: false 
    }, { status: 500 })
  }
}