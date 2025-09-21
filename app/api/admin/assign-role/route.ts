import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Security: This endpoint should be protected and only accessible by existing admins
// For initial setup, you can temporarily remove the admin check below

export async function POST(request: NextRequest) {
  try {
    const { email, role = 'admin', permissions = [] } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!['admin', 'editor'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "editor"' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    
    console.log('Admin Assignment - Processing request for email:', email, 'role:', role)

    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.error('Admin Assignment - User not found:', userError)
      return NextResponse.json(
        { error: 'User not found. Make sure the user has an account.' },
        { status: 404 }
      )
    }

    console.log('Admin Assignment - Found user:', user)

    // Check if user already has admin role
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingAdmin) {
      // Update existing admin role
      const { data: updatedAdmin, error: updateError } = await supabase
        .from('admin_users')
        .update({
          role: role,
          permissions: permissions,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Admin Assignment - Error updating admin role:', updateError)
        return NextResponse.json(
          { error: 'Failed to update admin role' },
          { status: 500 }
        )
      }

      console.log('Admin Assignment - Updated existing admin:', updatedAdmin)
      return NextResponse.json({
        success: true,
        message: `User ${email} role updated to ${role}`,
        admin: updatedAdmin,
        user: user
      })
    } else {
      // Create new admin entry
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          user_id: user.id,
          role: role,
          permissions: permissions
        })
        .select()
        .single()

      if (createError) {
        console.error('Admin Assignment - Error creating admin role:', createError)
        return NextResponse.json(
          { error: 'Failed to assign admin role' },
          { status: 500 }
        )
      }

      console.log('Admin Assignment - Created new admin:', newAdmin)
      return NextResponse.json({
        success: true,
        message: `User ${email} has been assigned ${role} role`,
        admin: newAdmin,
        user: user
      })
    }

  } catch (error) {
    console.error('Admin Assignment - Error:', error)
    return NextResponse.json(
      { error: 'Failed to assign admin role' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if a user is an admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Find the user and their admin status
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        admin_users (
          role,
          permissions,
          created_at
        )
      `)
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const isAdmin = user.admin_users && user.admin_users.length > 0
    const adminInfo = isAdmin ? user.admin_users[0] : null

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      },
      isAdmin,
      adminInfo
    })

  } catch (error) {
    console.error('Admin Check - Error:', error)
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    )
  }
}