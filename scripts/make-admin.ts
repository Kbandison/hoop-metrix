import { createClient } from '@supabase/supabase-js'

// This script makes a user an admin by their email
// Usage: npx ts-node scripts/make-admin.ts <email>

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function makeUserAdmin(email: string, role: 'admin' | 'editor' = 'admin') {
  try {
    console.log(`🔍 Looking up user with email: ${email}`)

    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.error('❌ User not found. Make sure the user has an account.')
      console.error('Error:', userError?.message)
      return false
    }

    console.log(`✅ Found user: ${user.full_name} (${user.email})`)

    // Check if user already has admin role
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingAdmin) {
      console.log(`ℹ️  User already has ${existingAdmin.role} role. Updating to ${role}...`)
      
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('❌ Failed to update admin role:', updateError.message)
        return false
      }

      console.log(`✅ Successfully updated ${email} to ${role} role!`)
    } else {
      console.log(`📝 Assigning ${role} role to user...`)
      
      const { error: createError } = await supabase
        .from('admin_users')
        .insert({
          user_id: user.id,
          role: role,
          permissions: []
        })

      if (createError) {
        console.error('❌ Failed to assign admin role:', createError.message)
        return false
      }

      console.log(`✅ Successfully assigned ${role} role to ${email}!`)
    }

    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

async function listAdmins() {
  try {
    console.log('📋 Current admin users:')
    
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select(`
        role,
        created_at,
        user_profiles (
          email,
          full_name
        )
      `)

    if (error) {
      console.error('❌ Failed to fetch admins:', error.message)
      return
    }

    if (!admins || admins.length === 0) {
      console.log('ℹ️  No admin users found.')
      return
    }

    admins.forEach((admin, index) => {
      const user = admin.user_profiles as any
      console.log(`${index + 1}. ${user.full_name} (${user.email}) - ${admin.role}`)
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('📖 Usage:')
    console.log('  Make admin:     npx ts-node scripts/make-admin.ts <email>')
    console.log('  Make editor:    npx ts-node scripts/make-admin.ts <email> editor')
    console.log('  List admins:    npx ts-node scripts/make-admin.ts --list')
    console.log('')
    console.log('Examples:')
    console.log('  npx ts-node scripts/make-admin.ts user@example.com')
    console.log('  npx ts-node scripts/make-admin.ts user@example.com editor')
    console.log('  npx ts-node scripts/make-admin.ts --list')
    process.exit(1)
  }

  if (args[0] === '--list') {
    await listAdmins()
    return
  }

  const email = args[0]
  const role = (args[1] as 'admin' | 'editor') || 'admin'

  if (!email.includes('@')) {
    console.error('❌ Please provide a valid email address')
    process.exit(1)
  }

  if (!['admin', 'editor'].includes(role)) {
    console.error('❌ Role must be either "admin" or "editor"')
    process.exit(1)
  }

  const success = await makeUserAdmin(email, role)
  
  if (success) {
    console.log('')
    console.log('🎉 Done! The user can now access admin features.')
    console.log('💡 Tip: Use --list to see all current admins')
  } else {
    process.exit(1)
  }
}

main().catch(console.error)