import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // First create minimal user profiles that orders can reference
    const placeholderUsers = [
      { id: '11111111-1111-1111-1111-111111111111', email: 'john.smith@email.com', full_name: 'John Smith' },
      { id: '22222222-2222-2222-2222-222222222222', email: 'sarah.johnson@email.com', full_name: 'Sarah Johnson' },
      { id: '33333333-3333-3333-3333-333333333333', email: 'mike.davis@email.com', full_name: 'Mike Davis' }
    ]

    let usersCreated = 0
    const errors = []

    // Create user profiles directly (bypass auth)
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .upsert(placeholderUsers.map(user => ({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          membership_status: 'free'
        })), { onConflict: 'id' })
        .select()

      if (profilesError) {
        errors.push(`Profiles error: ${profilesError.message}`)
      } else {
        usersCreated = placeholderUsers.length
        console.log(`✅ Created ${usersCreated} user profiles`)
      }
    } catch (error) {
      errors.push(`Exception creating profiles: ${error}`)
    }

    // Get existing products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(10)

    if (productsError || !products || products.length === 0) {
      return NextResponse.json({
        error: 'No products found. Please seed products first.',
        details: productsError
      }, { status: 400 })
    }

    // Create mock orders with valid user_ids and shipping addresses
    const mockOrders = [
      {
        user_id: placeholderUsers[0].id,
        total_amount: 149.98,
        status: 'completed',
        shipping_address: {
          name: 'John Smith',
          street: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          country: 'US'
        },
        items: [
          { product_id: products[0]?.id, quantity: 1, price: products[0]?.price || 0 },
          { product_id: products[8]?.id, quantity: 1, price: products[8]?.price || 0 }
        ]
      },
      {
        user_id: placeholderUsers[1].id,
        total_amount: 89.99,
        status: 'processing',
        shipping_address: {
          name: 'Sarah Johnson',
          street: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US'
        },
        items: [
          { product_id: products[5]?.id, quantity: 1, price: products[5]?.price || 0 }
        ]
      },
      {
        user_id: placeholderUsers[2].id,
        total_amount: 259.97,
        status: 'shipped',
        shipping_address: {
          name: 'Mike Davis',
          street: '789 Pine St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US'
        },
        items: [
          { product_id: products[6]?.id, quantity: 1, price: products[6]?.price || 0 },
          { product_id: products[2]?.id, quantity: 1, price: products[2]?.price || 0 },
          { product_id: products[8]?.id, quantity: 1, price: products[8]?.price || 0 }
        ]
      },
      {
        user_id: placeholderUsers[0].id,
        total_amount: 79.99,
        status: 'completed',
        shipping_address: {
          name: 'John Smith',
          street: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          country: 'US'
        },
        items: [
          { product_id: products[7]?.id, quantity: 1, price: products[7]?.price || 0 }
        ]
      },
      {
        user_id: placeholderUsers[1].id,
        total_amount: 199.99,
        status: 'pending',
        shipping_address: {
          name: 'Sarah Johnson',
          street: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US'
        },
        items: [
          { product_id: products[9]?.id, quantity: 1, price: products[9]?.price || 0 }
        ]
      }
    ]

    let ordersCreated = 0
    let orderItemsCreated = 0

    // Create orders
    for (const orderData of mockOrders) {
      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: orderData.user_id,
            total_amount: orderData.total_amount,
            status: orderData.status,
            shipping_address: orderData.shipping_address
          }])
          .select()
          .single()

        if (orderError) {
          errors.push(`Order error: ${orderError.message}`)
          continue
        }

        ordersCreated++

        // Create order items
        const orderItems = orderData.items
          .filter(item => item.product_id)
          .map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          }))

        if (orderItems.length > 0) {
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)
            .select()

          if (itemsError) {
            errors.push(`Order items error for order ${order.id}: ${itemsError.message}`)
          } else {
            orderItemsCreated += items.length
          }
        }

      } catch (error) {
        errors.push(`Exception creating order: ${error}`)
      }
    }

    return NextResponse.json({
      message: 'Simple orders seeding completed!',
      results: {
        usersCreated,
        ordersCreated,
        orderItemsCreated,
        errors
      },
      summary: {
        users: usersCreated,
        orders: ordersCreated,
        items: orderItemsCreated,
        errorCount: errors.length
      }
    })

  } catch (error) {
    console.error('Error seeding simple orders:', error)
    return NextResponse.json(
      { error: 'Failed to seed simple orders', details: error },
      { status: 500 }
    )
  }
}