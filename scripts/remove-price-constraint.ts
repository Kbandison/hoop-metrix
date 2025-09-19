import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function removePriceConstraint() {
  console.log('Removing price constraint from products table...')
  
  try {
    // Drop the price constraint
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_check;'
    })

    if (error) {
      console.error('Error removing constraint:', error)
      console.log('Trying alternative method...')
      
      // Alternative: Try using raw SQL
      const { data: altData, error: altError } = await supabase
        .from('products')
        .select('id')
        .limit(1)
      
      if (altError) {
        console.error('Cannot access products table:', altError)
        return
      }
      
      console.log('✅ Products table is accessible')
      console.log('⚠️  You\'ll need to remove the constraint manually in Supabase dashboard')
      console.log('   Go to: Database → Tables → products → Constraints')
      console.log('   Find "products_price_check" and delete it')
      return
    }

    console.log('✅ Price constraint removed successfully!')
    
  } catch (error) {
    console.error('Script error:', error)
    console.log('⚠️  Manual removal required in Supabase dashboard')
  }
}

// Run the script
removePriceConstraint()