import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyAdminAccess } from '@/lib/auth/admin-check'

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error: adminError } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: adminError }, { status: adminError === 'Not authenticated' ? 401 : 403 })
    }

    // Use service client for admin operations
    const supabase = createServiceClient()

    // Get orders with user details
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        order_items (
          quantity,
          price,
          products (name)
        ),
        user_profiles (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (ordersError) {
      throw ordersError
    }

    // Format orders for admin panel
    const formattedOrders = orders?.map(order => ({
      id: `HM-${new Date(order.created_at).getFullYear()}-${order.id.slice(-6)}`,
      customer: (order.user_profiles as any)?.full_name || (order.user_profiles as any)?.email || 'Unknown',
      items: order.order_items?.length || 0,
      total: order.total_amount,
      status: order.status,
      date: new Date(order.created_at).toLocaleDateString(),
      products: order.order_items?.map(item => (item.products as any)?.name).join(', ') || 'N/A'
    })) || []

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Skip auth check in development for now
    // TODO: Re-enable proper auth when RLS is fixed

    const { customer_email, items, total, status = 'pending' } = await request.json()

    // Find customer
    const { data: customer } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', customer_email)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        user_id: customer.id,
        total_amount: parseFloat(total),
        status
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    // Add order items if provided
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        throw itemsError
      }
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error: adminError } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: adminError }, { status: adminError === 'Not authenticated' ? 401 : 403 })
    }

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    // Use service client for admin operations
    const supabase = createServiceClient()

    // Extract the actual order ID from the formatted ID (HM-YEAR-XXXXXX -> XXXXXX)
    const actualOrderId = id.includes('-') ? id.split('-').pop() : id

    // Find the order by the last 6 characters of the ID
    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('id')
      .like('id', `%${actualOrderId}`)
      .limit(1)

    if (findError) {
      throw findError
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const realOrderId = orders[0].id

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', realOrderId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}