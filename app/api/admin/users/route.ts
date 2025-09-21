import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyAdminAccess } from '@/lib/auth/admin-check'

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: error === 'Not authenticated' ? 401 : 403 })
    }

    // Use service client for data queries to bypass RLS
    const supabase = createServiceClient()

    // Get users with profiles
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        membership_status,
        created_at,
        admin_users (role)
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      throw usersError
    }

    // Get auth users data for last sign in info
    const authUsers: { id: string; lastSignInAt: string | undefined }[] = []
    if (users) {
      for (const user of users) {
        try {
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id)
          if (!authError && authUser.user) {
            authUsers.push({
              id: authUser.user.id,
              lastSignInAt: authUser.user.last_sign_in_at
            })
          }
        } catch (error) {
          console.error(`Error fetching auth data for user ${user.id}:`, error)
        }
      }
    }

    // Format users for admin panel
    const formattedUsers = users?.map(user => {
      const authData = authUsers.find(au => au.id === user.id)
      // Handle both array and object responses from Supabase join
      const adminRoles = Array.isArray(user.admin_users) ? user.admin_users : (user.admin_users ? [user.admin_users] : [])
      const isAdmin = adminRoles.length > 0
      const adminRole = isAdmin ? adminRoles[0].role : null
      
      return {
        id: user.id,
        name: user.full_name || 'N/A',
        email: user.email,
        plan: user.membership_status === 'premium' ? '$10 Membership' : 'Free',
        joinDate: new Date(user.created_at).toLocaleDateString(),
        status: 'active', // User account status (active/inactive)
        lastLogin: authData?.lastSignInAt ? new Date(authData.lastSignInAt).toLocaleDateString() : 'Never',
        isAdmin: isAdmin,
        role: adminRole
      }
    }) || []

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Skip auth check in development for now
    // TODO: Re-enable proper auth when RLS is fixed

    const { name, email, plan, makeAdmin } = await request.json()

    // Create auth user
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: 'temp123!', // Temporary password
      email_confirm: true,
      user_metadata: { full_name: name }
    })

    if (createError) {
      throw createError
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email,
        full_name: name,
        membership_status: plan === '$10 Membership' ? 'premium' : 'free'
      }])

    if (profileError) {
      throw profileError
    }

    // Make admin if requested
    if (makeAdmin) {
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{
          user_id: authData.user.id,
          role: 'admin'
        }])

      if (adminError) {
        throw adminError
      }
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: error === 'Not authenticated' ? 401 : 403 })
    }

    const { id, name, email, plan, status } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Use service client for admin operations
    const supabase = createServiceClient()

    // Update user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        full_name: name,
        email: email,
        membership_status: plan === '$10 Membership' ? 'premium' : 'free'
      })
      .eq('id', id)

    if (profileError) {
      throw profileError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: error === 'Not authenticated' ? 401 : 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Use service client for admin operations
    const supabase = createServiceClient()

    // Delete from admin_users first (if exists)
    await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', id)

    // Delete user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      throw profileError
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) {
      console.error('Error deleting auth user:', authError)
      // Continue even if auth deletion fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}