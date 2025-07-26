import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Test creating a simple user
    const testEmail = 'test@hoopmetrix.com'
    const testPassword = 'test123!'
    
    console.log('Attempting to create test user...')
    
    // Try to create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { 
        full_name: 'Test User' 
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({
        error: 'Auth creation failed',
        details: authError.message,
        code: authError.code,
        suggestion: 'Check Supabase Auth settings and RLS policies'
      }, { status: 400 })
    }

    console.log('Auth user created successfully:', authData.user.id)

    // Try to create profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email: testEmail,
        full_name: 'Test User',
        membership_status: 'free'
      }])
      .select()
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return NextResponse.json({
        error: 'Profile creation failed',
        details: profileError.message,
        code: profileError.code,
        authUserCreated: true,
        authUserId: authData.user.id,
        suggestion: 'Check user_profiles table RLS policies and constraints'
      }, { status: 400 })
    }

    console.log('Profile created successfully:', profile)

    // Clean up test user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
    if (deleteError) {
      console.warn('Could not delete test user:', deleteError.message)
    }

    return NextResponse.json({
      message: 'User creation test successful!',
      testUser: {
        id: authData.user.id,
        email: testEmail,
        profile: profile
      },
      note: 'Test user was created and then deleted'
    })

  } catch (error) {
    console.error('Exception during user creation test:', error)
    return NextResponse.json(
      { 
        error: 'Exception during user creation test', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}