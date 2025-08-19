import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user with timeout
    const userPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )
    
    const { data: { user }, error } = await Promise.race([userPromise, timeoutPromise]) as any
    
    if (error || !user) {
      return NextResponse.json({ user: null, isAdmin: false }, { status: 401 })
    }

    // Try to get additional user data, but don't block on it
    try {
      // Use service client to bypass RLS for admin check
      const serviceSupabase = createServiceClient()

      // Get user profile with timeout
      const profilePromise = serviceSupabase
        .from('user_profiles')
        .select('membership_status, full_name')
        .eq('id', user.id)
        .single()
      
      const adminPromise = serviceSupabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const profileTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile timeout')), 3000)
      )

      const [profileResult, adminResult] = await Promise.allSettled([
        Promise.race([profilePromise, profileTimeout]),
        Promise.race([adminPromise, profileTimeout])
      ])

      const profile = profileResult.status === 'fulfilled' ? (profileResult.value as any).data : null
      const adminUser = adminResult.status === 'fulfilled' ? (adminResult.value as any).data : null

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || user.user_metadata?.full_name,
          membership_status: profile?.membership_status || 'free',
          role: adminUser?.role || 'user'
        },
        isAdmin: !!adminUser
      })
    } catch (dbError) {
      // If database queries fail, return basic user info
      console.error('Database error, returning basic user info:', dbError)
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          membership_status: 'free',
          role: 'user'
        },
        isAdmin: false
      })
    }

  } catch (error) {
    console.error('Auth user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}