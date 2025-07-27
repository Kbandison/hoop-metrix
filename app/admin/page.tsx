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
  Download,
  Shield,
  Settings,
  Database,
  Eye,
  Plus,
  ArrowRight,
  Crown,
  Zap,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductManager from '@/components/admin/product-manager'
import UserManager from '@/components/admin/user-manager'
import OrderManager from '@/components/admin/order-manager'
import TeamManager from '@/components/admin/team-manager'
import PlayerManager from '@/components/admin/player-manager'

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
  const [teamsTab, setTeamsTab] = useState('teams')
  
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
                <h1 className="text-4xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-gray-600 mt-2 text-lg">Manage your HoopMetrix platform</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-kentucky-blue-50 hover:border-kentucky-blue-300 hover:text-kentucky-blue-600 transition-colors"
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
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Admin Info Card */}
          <motion.div
            className="mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white shadow-2xl border-0 overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('/basketball-pattern.svg')] bg-repeat opacity-20"></div>
                </div>
                
                <CardContent className="p-8 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <Shield className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-yellow-900" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Administrator Dashboard</h2>
                        <p className="text-white/80 text-sm mb-3">Full platform management access</p>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-900 border-0 shadow-lg">
                            <Crown className="w-3 h-3 mr-1" />
                            Super Admin
                          </Badge>
                          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            <Zap className="w-3 h-3 mr-1" />
                            All Permissions
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <p className="text-white/80 text-sm mb-1">Platform Status</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <p className="font-bold text-lg">Online</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Users</CardTitle>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-green-600 font-medium">+12% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Active Subscriptions</CardTitle>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions.toLocaleString()}</div>
                  <p className="text-xs text-green-600 font-medium">+8% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Monthly Revenue</CardTitle>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-green-600 font-medium">+{stats.growthRate}% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Orders</CardTitle>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <ShoppingBag className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</div>
                  <p className="text-xs text-green-600 font-medium">+15% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Growth Rate</CardTitle>
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Activity className="h-4 w-4 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.growthRate}%</div>
                  <p className="text-xs text-gray-500">Monthly growth</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Admin Tabs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-white border shadow-sm rounded-lg">
                <TabsTrigger value="overview" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:!text-white transition-all duration-200">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:!text-white transition-all duration-200">
                  <Users className="w-4 h-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:!text-white transition-all duration-200">
                  <ShoppingBag className="w-4 h-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:!text-white transition-all duration-200">
                  <Package className="w-4 h-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:!text-white transition-all duration-200">
                  <Database className="w-4 h-4" />
                  Team Management
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:!text-white transition-all duration-200">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div variants={cardVariants}>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                      <CardHeader className="border-b bg-gradient-to-r from-kentucky-blue-50 to-blue-50">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                          <ShoppingBag className="w-5 h-5 text-kentucky-blue-600" />
                          Recent Orders
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                            <div>
                              <p className="font-medium text-gray-900">{order.id}</p>
                              <p className="text-sm text-gray-600">{order.customer}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${order.total}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {orders.length === 0 && (
                          <p className="text-gray-500 text-center py-8">No recent orders</p>
                        )}
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab('orders')}>
                          View All Orders
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariants}>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                          <Users className="w-5 h-5 text-green-600" />
                          New Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        {users.slice(0, 3).map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
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
                          <p className="text-gray-500 text-center py-8">No users yet</p>
                        )}
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab('users')}>
                          View All Users
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div variants={cardVariants}>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col gap-2 hover:bg-kentucky-blue-50 hover:border-kentucky-blue-300"
                          onClick={() => setActiveTab('content')}
                        >
                          <Plus className="w-5 h-5" />
                          Add Content
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                          onClick={() => setActiveTab('users')}
                        >
                          <Users className="w-5 h-5" />
                          Manage Users
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                          onClick={() => setActiveTab('products')}
                        >
                          <Package className="w-5 h-5" />
                          Manage Products
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300"
                          onClick={() => setActiveTab('analytics')}
                        >
                          <BarChart3 className="w-5 h-5" />
                          View Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
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

              {/* Team Management Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="border-b bg-gradient-to-r from-kentucky-blue-50 to-blue-50">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Database className="w-5 h-5 text-kentucky-blue-600" />
                      Team Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs value={teamsTab} onValueChange={setTeamsTab} className="space-y-6">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="teams" className="flex items-center gap-2 text-gray-700 data-[state=active]:text-gray-900">
                          <Shield className="w-4 h-4" />
                          Teams
                        </TabsTrigger>
                        <TabsTrigger value="players" className="flex items-center gap-2 text-gray-700 data-[state=active]:text-gray-900">
                          <User className="w-4 h-4" />
                          Players
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="teams">
                        <TeamManager onRefresh={() => fetchData()} />
                      </TabsContent>
                      
                      <TabsContent value="players">
                        <PlayerManager onRefresh={() => fetchData()} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Analytics Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                      <p className="text-gray-500 mb-6">Detailed insights, charts, and reporting tools will be available here.</p>
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </motion.div>
        </div>
      </div>
      
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