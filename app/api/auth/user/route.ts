import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ user: null, isAdmin: false }, { status: 401 })
    }

    // Use service client to bypass RLS for admin check
    const serviceSupabase = createServiceClient()

    // Get user profile
    const { data: profile } = await serviceSupabase
      .from('user_profiles')
      .select('membership_status, full_name')
      .eq('id', user.id)
      .single()

    // Check if user is admin
    const { data: adminUser } = await serviceSupabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name,
        membership_status: profile?.membership_status || 'free',
        role: adminUser?.role || 'user'
      },
      isAdmin: !!adminUser
    })

  } catch (error) {
    console.error('Auth user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}