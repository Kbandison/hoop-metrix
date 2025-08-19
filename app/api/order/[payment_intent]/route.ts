import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ payment_intent: string }> }
) {
  try {
    // Use service role client to bypass RLS for order lookup
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { payment_intent } = await params

    if (!payment_intent) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 })
    }

    console.log('Order API - Looking for payment intent:', payment_intent)

    // Find the order by payment_intent_id - NO FALLBACK
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        shipping_address,
        created_at,
        user_id,
        user_profiles(email, full_name),
        order_items(
          id,
          quantity,
          price,
          products(
            id,
            name,
            image_url,
            category
          )
        )
      `)
      .eq('payment_intent_id', payment_intent)
      .single()

    console.log('Order API - Found order:', order?.id || 'none')
    console.log('Order API - Error:', orderError)

    if (orderError || !order) {
      return NextResponse.json({ 
        error: 'Order not found',
        payment_intent_id: payment_intent,
        details: orderError?.message || 'No order exists with this payment intent ID'
      }, { status: 404 })
    }

    // Transform the data to match the frontend interface
    const orderItems = order.order_items || []
    const userProfile = order.user_profiles || {}
    const shippingAddress = order.shipping_address || {}

    console.log('Order API - Processing order items:', orderItems.length)
    console.log('Order API - Sample item structure:', orderItems[0])

    const transformedItems = orderItems.map((item: any) => {
      const product = item.products || {}
      return {
        id: product.id || item.product_id,
        name: product.name || 'Unknown Product',
        price: parseFloat(item.price) || 0,
        quantity: item.quantity || 1,
        image: product.image_url || '',
        category: product.category || 'General'
      }
    })

    const subtotal = transformedItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )

    const total = parseFloat(order.total_amount) || 0
    const shippingAndTax = Math.max(0, total - subtotal)
    const shipping = Math.min(shippingAndTax * 0.4, 15.99) // Estimate shipping
    const tax = shippingAndTax - shipping

    const orderDetails = {
      orderId: order.id,
      paymentIntentId: payment_intent,
      status: order.status === 'completed' ? 'confirmed' : order.status,
      items: transformedItems,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: total,
      customerInfo: {
        name: (userProfile as any)?.full_name || shippingAddress.name || 'Guest Customer',
        email: (userProfile as any)?.email || shippingAddress.email || '',
        phone: shippingAddress.phone || ''
      },
      shippingAddress: {
        street: shippingAddress.address || 'Address not collected during checkout',
        city: shippingAddress.city || 'Not provided',
        state: shippingAddress.state || 'Not provided', 
        zipCode: shippingAddress.zip || 'Not provided',
        country: shippingAddress.country || 'United States'
      },
      paymentMethod: 'Card',
      orderDate: new Date(order.created_at).toLocaleDateString(),
      estimatedDelivery: new Date(
        new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString()
    }

    console.log('Order API - Returning order details:', {
      orderId: orderDetails.orderId,
      total: orderDetails.total,
      itemCount: orderDetails.items.length,
      subtotal: orderDetails.subtotal,
      shipping: orderDetails.shipping,
      tax: orderDetails.tax
    })

    return NextResponse.json({
      success: true,
      order: orderDetails
    })

  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}