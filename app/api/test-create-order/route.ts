import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()
    
    const { 
      payment_intent_id, 
      amount_cents, 
      customer_name, 
      customer_email,
      items 
    } = body

    console.log('Test Create Order - Creating order for payment intent:', payment_intent_id)

    // Get or create user profile
    let userId = null
    if (customer_email) {
      // Try to find existing user
      const { data: existingUser, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', customer_email)
        .single()

      console.log('Test Create Order - Existing user lookup:', existingUser)
      console.log('Test Create Order - User lookup error:', userError)

      if (existingUser) {
        userId = existingUser.id
        console.log('Test Create Order - Found existing user ID:', userId)
      } else {
        // Create guest user profile
        const { data: newUser, error: userError } = await supabase
          .from('user_profiles')
          .insert({
            email: customer_email,
            full_name: customer_name,
            membership_status: 'free'
          })
          .select('id')
          .single()

        if (userError) {
          console.error('Error creating user profile:', userError)
        } else {
          userId = newUser.id
        }
      }
    }

    // Create shipping address
    const shippingAddress = {
      name: customer_name,
      email: customer_email
    }

    // Create order - if no userId, we need to handle this differently
    if (!userId) {
      // For testing, let's just use a placeholder or skip the order creation
      console.log('Test Create Order - No user ID available, creating minimal test order')
      return NextResponse.json({
        success: false,
        error: 'No user ID available - orders table requires user_id',
        debug: 'Consider adding guest user support or modifying orders table'
      })
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: amount_cents / 100, // Convert from cents
        status: 'completed',
        shipping_address: shippingAddress
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    console.log('Test Create Order - Order created:', order.id)

    // Create order items if provided
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
      } else {
        console.log('Test Create Order - Order items created:', orderItems.length)
      }
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      message: 'Test order created successfully'
    })

  } catch (error) {
    console.error('Test Create Order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}