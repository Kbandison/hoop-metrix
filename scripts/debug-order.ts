import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugOrder() {
  console.log('Debugging order shipping address...')
  
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_intent_id', 'pi_3RsoxlCYWJCJQ2h31MoAxAMd')
    .single()
    
  if (order) {
    console.log('Order shipping_address field:', JSON.stringify(order.shipping_address, null, 2))
  } else {
    console.log('Order not found:', error)
  }
}

debugOrder().catch(console.error)