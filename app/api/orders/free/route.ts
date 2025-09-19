import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { items, customer_details, shipping_address } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Calculate total amount to verify it's actually free
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    
    if (totalAmount > 0) {
      return NextResponse.json(
        { error: 'This endpoint is only for free orders' },
        { status: 400 }
      )
    }

    console.log('Free Order API - Processing free order for:', customer_details?.email)
    console.log('Free Order API - Items:', items.length)

    const supabase = createServiceClient()

    // Get or create user profile for the customer
    let userId = null
    const customerEmail = customer_details?.email

    if (customerEmail) {
      // Try to find existing user by email
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', customerEmail)
        .single()

      if (existingUser) {
        userId = existingUser.id
      } else {
        // Create guest user profile
        const { data: newUser, error: userError } = await supabase
          .from('user_profiles')
          .insert({
            email: customerEmail,
            full_name: customer_details?.name,
            membership_status: 'free'
          })
          .select('id')
          .single()

        if (userError) {
          console.error('Error creating user profile:', userError)
          // Continue without user_id for guest orders
        } else {
          userId = newUser.id
        }
      }
    }

    // Create shipping address object
    const shippingAddressData = {
      name: customer_details?.name,
      email: customerEmail,
      address1: shipping_address?.address1,
      address2: shipping_address?.address2,
      city: shipping_address?.city,
      state: shipping_address?.state,
      zipCode: shipping_address?.zipCode,
      country: shipping_address?.country || 'US',
      phone: customer_details?.phone
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: 0, // Free order
        status: 'completed',
        shipping_address: shippingAddressData,
        payment_method: 'free'
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    console.log('Free Order API - Order created successfully:', order?.id)

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order?.id,
      product_id: item.id,
      quantity: item.quantity,
      price: 0 // Free items
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    console.log('Free Order API - Order items created:', orderItems.length)

    // Generate a fake order ID that looks like a payment intent for consistency
    const fakeOrderId = `free_order_${order.id}_${Date.now()}`

    return NextResponse.json({
      success: true,
      orderId: order.id,
      fakePaymentIntentId: fakeOrderId // For URL consistency
    })

  } catch (error) {
    console.error('Error processing free order:', error)
    return NextResponse.json(
      { error: 'Failed to process free order' },
      { status: 500 }
    )
  }
}