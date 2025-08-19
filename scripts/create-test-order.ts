import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createTestOrder() {
  console.log('Creating test order...')
  
  try {
    // First, get or create a test user
    const testUserId = 'a49bd663-3667-49c6-b402-f6591bb4c7d3' // From the existing user

    // Get some products for the order
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, image_url, category')
      .limit(2)

    if (productsError || !products || products.length === 0) {
      console.error('No products found:', productsError)
      return
    }

    console.log('Using products:', products.map(p => ({ id: p.id, name: p.name, price: p.price })))

    // Create the order
    const orderData = {
      user_id: testUserId,
      total_amount: products.reduce((sum, p) => sum + parseFloat(p.price), 0),
      status: 'completed',
      payment_intent_id: 'pi_test_' + Date.now(),
      shipping_address: {
        name: 'Kevin Bandison',
        email: 'kbandison@gmail.com',
        address: '123 Test Street',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
        phone: '+1 (555) 123-4567'
      }
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return
    }

    console.log('Created order:', order)

    // Create order items
    const orderItems = products.map((product, index) => ({
      order_id: order.id,
      product_id: product.id,
      quantity: 1,
      price: product.price
    }))

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      return
    }

    console.log('Created order items:', items)

    console.log(`Test order created successfully!`)
    console.log(`Order ID: ${order.id}`)
    console.log(`Payment Intent: ${orderData.payment_intent_id}`)
    console.log(`Test URL: http://localhost:3000/shop/order-confirmation?payment_intent=${orderData.payment_intent_id}`)

  } catch (error) {
    console.error('Failed to create test order:', error)
  }
}

createTestOrder()