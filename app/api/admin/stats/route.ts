import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyAdminAccess } from '@/lib/auth/admin-check'

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error } = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: error === 'Not authenticated' ? 401 : 403 })
    }

    // Use service client for data queries to bypass RLS
    const supabase = createServiceClient()

    // Get total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // Get premium subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('membership_status', 'premium')

    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // Get monthly revenue (sum of orders from this month)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthlyOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startOfMonth.toISOString())
      .eq('status', 'completed')

    const monthlyRevenue = monthlyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    // Calculate growth rate (simplified - comparing this month vs last month users)
    const startOfLastMonth = new Date()
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
    startOfLastMonth.setDate(1)
    startOfLastMonth.setHours(0, 0, 0, 0)

    const { count: thisMonthUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    const { count: lastMonthUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString())

    const growthRate = (lastMonthUsers ?? 0) > 0 
      ? (((thisMonthUsers ?? 0) - (lastMonthUsers ?? 0)) / (lastMonthUsers ?? 0)) * 100
      : 0

    const stats = {
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      monthlyRevenue: monthlyRevenue,
      totalOrders: totalOrders || 0,
      growthRate: Math.round(growthRate * 10) / 10
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}