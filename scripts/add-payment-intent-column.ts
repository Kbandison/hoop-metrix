import { createClient } from '@supabase/supabase-js'

async function addPaymentIntentColumn() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    console.log('Adding payment_intent_id column to orders table...')
    
    // Add the column
    const { error: addColumnError } = await supabase.rpc('sql', {
      query: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;'
    })

    if (addColumnError) {
      console.error('Error adding column:', addColumnError)
      // Try alternative approach
      console.log('Trying alternative approach...')
      
      const { error: error2 } = await supabase
        .from('orders')
        .select('payment_intent_id')
        .limit(1)
        
      if (error2 && error2.message.includes('does not exist')) {
        console.log('Column does not exist, but cannot add via API. Please run SQL manually.')
        console.log('SQL to run: ALTER TABLE orders ADD COLUMN payment_intent_id TEXT;')
        console.log('SQL to run: CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id);')
      } else {
        console.log('Column already exists or other error:', error2)
      }
    } else {
      console.log('Column added successfully')
      
      // Add index
      const { error: indexError } = await supabase.rpc('sql', {
        query: 'CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);'
      })
      
      if (indexError) {
        console.log('Index creation failed:', indexError)
      } else {
        console.log('Index created successfully')
      }
    }

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Run the migration
addPaymentIntentColumn().then(() => {
  console.log('Migration completed')
  process.exit(0)
}).catch(error => {
  console.error('Migration script failed:', error)
  process.exit(1)
})