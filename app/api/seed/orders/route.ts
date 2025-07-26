import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // First, create mock users and profiles for orders
    const mockUsers = [
      { email: 'john.smith@email.com', full_name: 'John Smith', password: 'temp123!' },
      { email: 'sarah.johnson@email.com', full_name: 'Sarah Johnson', password: 'temp123!' },
      { email: 'mike.davis@email.com', full_name: 'Mike Davis', password: 'temp123!' },
      { email: 'alex.thompson@email.com', full_name: 'Alex Thompson', password: 'temp123!' },
      { email: 'jessica.chen@email.com', full_name: 'Jessica Chen', password: 'temp123!' }
    ]

    const createdUsers = []
    
    // Create users first
    for (const userData of mockUsers) {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: { full_name: userData.full_name }
        })

        if (authError) {
          // If user already exists, try to find them
          console.log(`Auth error for ${userData.email}:`, authError.message)
          continue
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            membership_status: 'free'
          }])

        if (profileError) {
          console.log(`Profile error for ${userData.email}:`, profileError.message)
          continue
        }

        createdUsers.push({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name
        })
      } catch (error) {
        console.log(`Exception creating user ${userData.email}:`, error)
      }
    }

    // If no users were created, create placeholder user profiles directly
    if (createdUsers.length === 0) {
      console.log('No users created via auth, using placeholder approach...')
      
      // Generate some UUIDs for mock users
      const placeholderUsers = [
        { id: '11111111-1111-1111-1111-111111111111', email: 'john.smith@email.com', full_name: 'John Smith' },
        { id: '22222222-2222-2222-2222-222222222222', email: 'sarah.johnson@email.com', full_name: 'Sarah Johnson' },
        { id: '33333333-3333-3333-3333-333333333333', email: 'mike.davis@email.com', full_name: 'Mike Davis' }
      ]

      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .insert(placeholderUsers.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            membership_status: 'free'
          })))
          .select()

        if (!profilesError) {
          createdUsers.push(...placeholderUsers)
        }
      } catch (error) {
        console.log('Error creating placeholder profiles:', error)
      }
    }

    if (createdUsers.length === 0) {
      return NextResponse.json({
        error: 'Could not create any users for orders. Database auth might be disabled.',
        suggestion: 'Check Supabase auth settings'
      }, { status: 400 })
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

    // Create mock orders matching the schema
    const mockOrders = [
      {
        user_id: createdUsers[0]?.id,
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
        user_id: createdUsers[1]?.id || createdUsers[0]?.id,
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
        user_id: createdUsers[2]?.id || createdUsers[0]?.id,
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
      }
    ]

    let ordersCreated = 0
    let orderItemsCreated = 0
    const errors = []

    // Create orders
    for (const orderData of mockOrders) {
      if (!orderData.user_id) {
        errors.push('No user_id available for order')
        continue
      }

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
          .filter(item => item.product_id) // Only items with valid product IDs
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
      message: 'Orders seeding completed!',
      results: {
        usersCreated: createdUsers.length,
        ordersCreated,
        orderItemsCreated,
        errors
      },
      summary: {
        users: createdUsers.length,
        orders: ordersCreated,
        items: orderItemsCreated,
        errorCount: errors.length
      }
    })

  } catch (error) {
    console.error('Error seeding orders:', error)
    return NextResponse.json(
      { error: 'Failed to seed orders', details: error },
      { status: 500 }
    )
  }
}