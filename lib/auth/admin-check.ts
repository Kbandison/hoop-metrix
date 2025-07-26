import { createClient } from '@/lib/supabase/server'

export async function verifyAdminAccess() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { isAdmin: false, error: 'Not authenticated' }
    }

    // Check if user is admin using the service role client to bypass RLS
    const { createServiceClient } = await import('@/lib/supabase/server')
    const serviceSupabase = createServiceClient()
    
    const { data: adminUser, error: adminError } = await serviceSupabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    // If no admin record found, that's okay - just not an admin
    if (adminError && adminError.code === 'PGRST116') {
      return { isAdmin: false, error: 'Admin access required' }
    }
    
    // If other error, something is wrong
    if (adminError) {
      console.error('Admin check error:', adminError)
      return { isAdmin: false, error: 'Database error checking admin status' }
    }

    return { isAdmin: true, user, adminRole: adminUser.role }
  } catch (error) {
    console.error('verifyAdminAccess exception:', error)
    return { isAdmin: false, error: 'Internal server error' }
  }
}