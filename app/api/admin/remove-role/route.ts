import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyAdminAccess } from '@/lib/auth/admin-check'

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: error === 'Not authenticated' ? 401 : 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    
    console.log('Admin Role Removal - Processing request for user ID:', userId)

    // Check if user has admin role
    const { data: adminUser, error: adminCheckError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (adminCheckError || !adminUser) {
      console.error('Admin Role Removal - Admin role not found:', adminCheckError)
      return NextResponse.json(
        { error: 'User does not have admin role' },
        { status: 404 }
      )
    }

    console.log('Admin Role Removal - Found admin user:', adminUser)

    // Remove admin role
    const { error: removeError } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId)

    if (removeError) {
      console.error('Admin Role Removal - Error removing admin role:', removeError)
      return NextResponse.json(
        { error: 'Failed to remove admin role' },
        { status: 500 }
      )
    }

    console.log('Admin Role Removal - Successfully removed admin role for user:', userId)
    return NextResponse.json({
      success: true,
      message: 'Admin role removed successfully'
    })

  } catch (error) {
    console.error('Admin Role Removal - Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove admin role' },
      { status: 500 }
    )
  }
}