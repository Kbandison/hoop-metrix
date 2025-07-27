import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        membership_status,
        membership_expires_at,
        stripe_customer_id,
        created_at
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Get user orders with items
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
          products (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (ordersError) {
      console.error('Orders fetch error:', ordersError)
      // Don't fail the request if orders can't be fetched
    }

    // Calculate stats
    const totalOrders = orders?.length || 0
    const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0
    const memberSince = profile?.created_at ? 
      Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0

    // Format orders for frontend
    const formattedOrders = orders?.map(order => ({
      id: order.id,
      date: new Date(order.created_at).toLocaleDateString(),
      total: parseFloat(order.total_amount.toString()),
      status: order.status,
      items: order.order_items?.length || 0,
      products: order.order_items?.map(item => item.products?.name).join(', ')
    })) || []

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const accountData = {
      profile: {
        name: profile.full_name || 'User',
        email: profile.email,
        phone: '', // Not stored in current schema
        address: '', // Not stored in current schema
        joinDate: new Date(profile.created_at).toLocaleDateString(),
        avatar: '/placeholder-avatar.jpg'
      },
      subscription: {
        plan: profile.membership_status === 'premium' ? 'HoopMetrix Premium' : 'Free',
        status: profile.membership_status === 'premium' ? 'active' : 'inactive',
        nextBilling: profile.membership_expires_at ? 
          new Date(profile.membership_expires_at).toLocaleDateString() : null,
        price: profile.membership_status === 'premium' ? 10.00 : 0,
        interval: 'monthly'
      },
      stats: {
        ordersPlaced: totalOrders,
        totalSpent: totalSpent,
        wishlistItems: 0, // TODO: Add wishlist table
        memberSince: memberSince > 0 ? `${memberSince} months` : 'Less than a month'
      },
      orders: formattedOrders,
      isAdmin: !!adminUser
    }

    return NextResponse.json(accountData)

  } catch (error) {
    console.error('Account API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}