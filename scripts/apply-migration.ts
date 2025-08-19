import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyMigration() {
  console.log('Applying database migration...')
  
  try {
    // Check current table structure by selecting from orders
    console.log('Step 1: Checking current table structure...')
    const { data: sampleOrder, error: selectError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
      .single()
    
    console.log('Sample order structure:', Object.keys(sampleOrder || {}))
    console.log('Select error:', selectError)
    
    // Check if payment_intent_id column exists by trying to select it specifically
    const { data: paymentIntentTest, error: paymentIntentError } = await supabase
      .from('orders')
      .select('payment_intent_id')
      .limit(1)
    
    if (paymentIntentError) {
      console.log('payment_intent_id column does not exist, error:', paymentIntentError.message)
      console.log('Need to add the column manually via Supabase dashboard')
    } else {
      console.log('payment_intent_id column exists!')
    }
    
    console.log('Migration check completed')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyMigration()