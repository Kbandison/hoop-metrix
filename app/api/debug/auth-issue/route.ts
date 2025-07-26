import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Check 1: Can we access auth.users table?
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(1)
    
    // Check 2: Can we access user_profiles table?
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(1)
    
    // Check 3: Test direct insert into user_profiles (bypass auth)
    const testUserId = '12345678-1234-1234-1234-123456789012'
    const { data: testInsert, error: insertError } = await supabase
      .from('user_profiles')
      .insert([{
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User'
      }])
      .select()
    
    // Clean up test insert
    if (testInsert) {
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', testUserId)
    }
    
    // Check 4: Look at RLS policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
              FROM pg_policies 
              WHERE tablename = 'user_profiles';` 
      })
    
    return NextResponse.json({
      tests: {
        authUsers: {
          success: !authError,
          error: authError?.message,
          count: authUsers?.length || 0
        },
        userProfiles: {
          success: !profilesError,
          error: profilesError?.message,
          count: profiles?.length || 0
        },
        directInsert: {
          success: !insertError,
          error: insertError?.message,
          data: testInsert
        },
        policies: {
          success: !policiesError,
          error: policiesError?.message,
          data: policies
        }
      },
      diagnosis: getDignosisFromResults(!authError, !profilesError, !insertError)
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

function getDignosisFromResults(authOk: boolean, profilesOk: boolean, insertOk: boolean) {
  if (!authOk) {
    return "Cannot access auth.users table - fundamental Supabase issue"
  }
  if (!profilesOk) {
    return "Cannot access user_profiles table - check table exists and RLS"
  }
  if (!insertOk) {
    return "Cannot insert into user_profiles - likely RLS policy or constraint issue"
  }
  return "All basic operations work - issue might be in auth trigger or schema"
}