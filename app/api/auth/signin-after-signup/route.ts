import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()

    // Sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Sign in after signup error:', authError)
      return NextResponse.json(
        { error: authError.message || 'Failed to sign in' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 500 }
      )
    }

    // Get updated user profile to confirm premium status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('membership_status, stripe_customer_id')
      .eq('id', authData.user.id)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        membership_status: profile?.membership_status || 'free'
      }
    })

  } catch (error) {
    console.error('Sign in after signup error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate user' },
      { status: 500 }
    )
  }
}