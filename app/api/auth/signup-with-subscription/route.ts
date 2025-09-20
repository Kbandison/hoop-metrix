import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Add timeout for the entire request
export const maxDuration = 60 // 60 seconds

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, planId, billingCycle } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    console.log('Signup API - Creating user account for:', email)

    // First check if user already exists
    try {
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('email', email)
        .single()

      if (existingUser) {
        console.log('Signup API - User already exists with email:', email)
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        )
      }
    } catch (error) {
      // User doesn't exist, continue with signup
      console.log('Signup API - No existing user found, proceeding with signup')
    }

    // Create the user account with retry logic
    let authData, authError
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Signup API - Attempt ${attempt} for user signup`)
        const result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: full_name
            }
          }
        })
        
        authData = result.data
        authError = result.error
        
        if (!authError) {
          console.log('Signup API - User account created successfully')
          break
        }
        
        console.error(`Signup API - Attempt ${attempt} failed:`, authError)
        
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        
      } catch (error) {
        console.error(`Signup API - Attempt ${attempt} threw error:`, error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        authError = { message: `Connection error on attempt ${attempt}: ${errorMessage}` }
        
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }

    if (authError) {
      console.error('Signup error after all retries:', authError)
      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    if (!authData || !authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: full_name,
        membership_status: 'free', // Will update to premium after subscription
        created_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the request if profile creation fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: full_name
      },
      planId,
      billingCycle
    })

  } catch (error) {
    console.error('Signup with subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}