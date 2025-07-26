import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Since we can't easily create users due to auth constraints,
    // let's just update the admin API to return mock order data when there are no real orders
    
    // For now, let's check if we have any existing users we can use
    const { data: existingUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .limit(5)

    if (usersError) {
      return NextResponse.json({
        error: 'Could not fetch existing users',
        details: usersError.message
      }, { status: 500 })
    }

    if (!existingUsers || existingUsers.length === 0) {
      return NextResponse.json({
        message: 'No existing users found. Orders require valid user accounts.',
        suggestion: 'The admin panel will show mock data when no real orders exist.',
        note: 'Products were successfully seeded and will show up in the admin panel.'
      })
    }

    // Get existing products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(10)

    if (productsError || !products || products.length === 0) {
      return NextResponse.json({
        error: 'No products found. Please seed products first.'
      }, { status: 400 })
    }

    // Create orders using existing users
    const mockOrders = existingUsers.slice(0, 3).map((user, index) => ({
      user_id: user.id,
      total_amount: [149.98, 89.99, 259.97][index],
      status: ['completed', 'pending', 'shipped'][index] as 'completed' | 'pending' | 'shipped',
      shipping_address: {
        name: user.full_name || 'Customer',
        street: ['123 Main St', '456 Oak Ave', '789 Pine St'][index],
        city: ['Los Angeles', 'San Francisco', 'New York'][index],
        state: ['CA', 'CA', 'NY'][index],
        zip: ['90210', '94102', '10001'][index],
        country: 'US'
      }
    }))

    let ordersCreated = 0
    let orderItemsCreated = 0
    const errors = []

    // Create orders
    for (let i = 0; i < mockOrders.length; i++) {
      const orderData = mockOrders[i]
      
      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single()

        if (orderError) {
          errors.push(`Order ${i + 1} error: ${orderError.message}`)
          continue
        }

        ordersCreated++

        // Add 1-3 items per order
        const itemCount = Math.min(i + 1, 3)
        const orderItems = []
        
        for (let j = 0; j < itemCount; j++) {
          if (products[j]) {
            orderItems.push({
              order_id: order.id,
              product_id: products[j].id,
              quantity: 1,
              price: products[j].price
            })
          }
        }

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
        errors.push(`Exception creating order ${i + 1}: ${error}`)
      }
    }

    return NextResponse.json({
      message: 'Mock orders created successfully!',
      results: {
        existingUsers: existingUsers.length,
        ordersCreated,
        orderItemsCreated,
        errors
      },
      summary: {
        orders: ordersCreated,
        items: orderItemsCreated,
        errorCount: errors.length
      }
    })

  } catch (error) {
    console.error('Error seeding mock orders:', error)
    return NextResponse.json(
      { error: 'Failed to seed mock orders', details: error },
      { status: 500 }
    )
  }
}