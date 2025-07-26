import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, category')
      .limit(20)

    // Check users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, membership_status')
      .limit(20)

    // Check orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .limit(20)

    return NextResponse.json({
      products: {
        count: products?.length || 0,
        data: products || [],
        error: productsError?.message
      },
      users: {
        count: users?.length || 0,
        data: users || [],
        error: usersError?.message
      },
      orders: {
        count: orders?.length || 0,
        data: orders || [],
        error: ordersError?.message
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check data', details: error },
      { status: 500 }
    )
  }
}