import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already admin
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ message: 'User is already an admin', user })
    }

    // Make user admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .insert([{
        user_id: user.id,
        role: 'admin'
      }])
      .select()
      .single()

    if (adminError) {
      return NextResponse.json({ error: 'Failed to create admin user', details: adminError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'User successfully made admin!',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: 'admin'
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to make user admin', details: error },
      { status: 500 }
    )
  }
}