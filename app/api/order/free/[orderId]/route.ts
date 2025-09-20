import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const params = await context.params
    // Extract the actual order ID from the fake payment intent ID
    // Format: free_order_{orderId}_{timestamp}
    const fakePaymentIntentId = params.orderId
    console.log('Free Order API - Looking up order for fake payment intent:', fakePaymentIntentId)
    
    if (!fakePaymentIntentId.startsWith('free_order_')) {
      return NextResponse.json(
        { error: 'Invalid free order ID format' },
        { status: 400 }
      )
    }

    // Extract order ID from fake payment intent ID
    const parts = fakePaymentIntentId.split('_')
    if (parts.length < 3) {
      return NextResponse.json(
        { error: 'Invalid free order ID format' },
        { status: 400 }
      )
    }
    
    const actualOrderId = parts[2] // free_order_{orderId}_{timestamp}
    console.log('Free Order API - Extracted order ID:', actualOrderId)

    const supabase = createServiceClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product_id
        )
      `)
      .eq('id', actualOrderId)
      .single()

    if (orderError || !order) {
      console.error('Free Order API - Order not found:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('Free Order API - Order found:', order.id)

    // Format order for the frontend
    const formattedOrder = {
      id: order.id,
      status: order.status,
      total_amount: order.total_amount || 0,
      created_at: order.created_at,
      shipping_address: order.shipping_address || {},
      payment_method: order.payment_method || 'free',
      items: order.order_items || [],
      user_id: order.user_id
    }

    return NextResponse.json({
      success: true,
      order: formattedOrder
    })

  } catch (error) {
    console.error('Free Order API - Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    )
  }
}