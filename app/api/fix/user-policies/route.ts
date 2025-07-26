import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    const policies = [
      // Allow users to insert their own profile
      `CREATE POLICY "Users can insert own profile" ON user_profiles
       FOR INSERT WITH CHECK (auth.uid() = id);`,
      
      // Allow service role to manage user profiles
      `CREATE POLICY "Service role can manage user profiles" ON user_profiles
       FOR ALL USING (auth.role() = 'service_role');`,
      
      // Allow admins to view all user profiles
      `CREATE POLICY "Admins can view all user profiles" ON user_profiles
       FOR SELECT USING (
         auth.uid() IN (
           SELECT user_id FROM admin_users WHERE role = 'admin'
         )
       );`,
      
      // Allow service role to manage admin_users
      `CREATE POLICY "Service role can manage admin users" ON admin_users
       FOR ALL USING (auth.role() = 'service_role');`
    ]
    
    const results = []
    
    for (let i = 0; i < policies.length; i++) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policies[i] })
        if (error) {
          results.push({ policy: i + 1, error: error.message })
        } else {
          results.push({ policy: i + 1, success: true })
        }
      } catch (err) {
        results.push({ policy: i + 1, error: String(err) })
      }
    }
    
    return NextResponse.json({
      message: 'Attempted to fix user policies',
      results,
      note: 'If this fails, run the SQL manually in Supabase dashboard'
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fix policies', details: error },
      { status: 500 }
    )
  }
}