'use client'

import { useState, useEffect } from 'react'
import AdminGuard from '@/components/auth/admin-guard'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  User,
  Package,
  CreditCard,
  Activity,
  AlertCircle,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navigation from '@/components/layout/navigation'
import Footer from '@/components/layout/footer'
import ProductManager from '@/components/admin/product-manager'
import UserManager from '@/components/admin/user-manager'
import OrderManager from '@/components/admin/order-manager'

// Types for admin data
interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
  totalOrders: number
  growthRate: number
}

interface AdminUser {
  id: string
  name: string
  email: string
  plan: string
  joinDate: string
  status: string
  lastLogin?: string
}

interface AdminOrder {
  id: string
  customer: string
  items: number
  total: number
  status: string
  date: string
  products?: string
}

interface AdminProduct {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: string
  sales: number
  rating?: number
  image?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // State for real data
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeSubscriptions: 0, monthlyRevenue: 0, totalOrders: 0, growthRate: 0 })
  const [users, setUsers] = useState<AdminUser[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [statsRes, usersRes, ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/products')
      ])

      // Check each response individually to identify which is failing
      if (!statsRes.ok) {
        console.error('Stats API failed:', statsRes.status, statsRes.statusText)
        throw new Error(`Stats API failed: ${statsRes.status}`)
      }
      if (!usersRes.ok) {
        console.error('Users API failed:', usersRes.status, usersRes.statusText)
        throw new Error(`Users API failed: ${usersRes.status}`)
      }
      if (!ordersRes.ok) {
        console.error('Orders API failed:', ordersRes.status, ordersRes.statusText)
        throw new Error(`Orders API failed: ${ordersRes.status}`)
      }
      if (!productsRes.ok) {
        console.error('Products API failed:', productsRes.status, productsRes.statusText)
        throw new Error(`Products API failed: ${productsRes.status}`)
      }

      const [statsData, usersData, ordersData, productsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        ordersRes.json(),
        productsRes.json()
      ])

      setStats(statsData.stats)
      setUsers(usersData.users)
      setOrders(ordersData.orders)
      setProducts(productsData.products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case '$10 Membership':
        return 'bg-gradient-to-r from-kentucky-blue-500 to-kentucky-blue-600 text-white'
      case 'Free':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kentucky-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Error loading admin dashboard</p>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-kentucky-blue-600 hover:bg-kentucky-blue-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between pt-16">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your HoopMetrix platform</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    const baseUrl = typeof window !== 'undefined' && window.location.origin
                      ? window.location.origin
                      : 'http://localhost:3000'
                    window.location.href = `${baseUrl}/dashboard`
                  }}
                >
                  <User className="w-4 h-4" />
                  Customer Portal
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // TODO: Implement export functionality
                    console.log('Export functionality coming soon!')
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white border shadow-sm rounded-lg p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-kentucky-blue-600 data-[state=active]:to-kentucky-blue-700 data-[state=active]:text-white transition-all duration-200">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-kentucky-blue-600 data-[state=active]:to-kentucky-blue-700 data-[state=active]:text-white transition-all duration-200">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-kentucky-blue-600 data-[state=active]:to-kentucky-blue-700 data-[state=active]:text-white transition-all duration-200">
                <ShoppingBag className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-kentucky-blue-600 data-[state=active]:to-kentucky-blue-700 data-[state=active]:text-white transition-all duration-200">
                <Package className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-kentucky-blue-600 data-[state=active]:to-kentucky-blue-700 data-[state=active]:text-white transition-all duration-200">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={cardVariants}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeSubscriptions.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">+8% from last month</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">+{stats.growthRate}% from last month</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.growthRate}%</div>
                      <p className="text-xs text-muted-foreground">Monthly growth</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={cardVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Recent Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${order.total}</p>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No recent orders</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        New Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {users.slice(0, 3).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getPlanColor(user.plan)}>
                              {user.plan}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{user.joinDate}</p>
                          </div>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No users yet</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <UserManager users={users} onRefresh={() => fetchData()} />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <OrderManager orders={orders} onRefresh={() => fetchData()} />
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <ProductManager products={products} onRefresh={() => fetchData()} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">Analytics dashboard coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  )
}