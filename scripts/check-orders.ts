import { createClient } from '@supabase/supabase-js'

async function checkOrders() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    console.log('Checking orders in database...')
    
    // Check orders table
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('Orders found:', orders?.length || 0)
    console.log('Orders error:', ordersError)
    
    if (orders && orders.length > 0) {
      console.log('Recent orders:')
      orders.forEach((order, index) => {
        console.log(`  ${index + 1}. ID: ${order.id}`)
        console.log(`     Total: $${order.total_amount}`)
        console.log(`     Status: ${order.status}`)
        console.log(`     Created: ${order.created_at}`)
        console.log(`     User ID: ${order.user_id}`)
        console.log('     ---')
      })
    }

    // Check order_items table
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(10)

    console.log('Order items found:', orderItems?.length || 0)
    console.log('Order items error:', itemsError)

    // Check user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5)

    console.log('User profiles found:', profiles?.length || 0)
    console.log('User profiles error:', profilesError)
    
    if (profiles && profiles.length > 0) {
      console.log('User profiles:')
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile.id}`)
        console.log(`     Email: ${profile.email}`)
        console.log(`     Name: ${profile.full_name}`)
        console.log(`     Created: ${profile.created_at}`)
        console.log('     ---')
      })
    }

  } catch (error) {
    console.error('Check failed:', error)
  }
}

// Run the check
checkOrders().then(() => {
  console.log('Database check completed')
  process.exit(0)
}).catch(error => {
  console.error('Check script failed:', error)
  process.exit(1)
})