'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Settings,
  User,
  Package,
  CreditCard,
  Activity,
  AlertCircle,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Shield,
  Zap,
  Star,
  Clock,
  DollarSign,
  Mail,
  Phone,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Navigation from '@/components/layout/navigation'
import Footer from '@/components/layout/footer'

// Mock data for dashboard
const DASHBOARD_STATS = {
  totalUsers: 12847,
  activeSubscriptions: 3241,
  monthlyRevenue: 89450,
  totalOrders: 1592,
  growthRate: 24.5
}

const RECENT_ORDERS = [
  {
    id: 'HM-2024-001234',
    customer: 'John Smith',
    items: 2,
    total: 149.98,
    status: 'completed',
    date: '2024-01-15'
  },
  {
    id: 'HM-2024-001235',
    customer: 'Sarah Johnson',
    items: 1,
    total: 89.99,
    status: 'processing',
    date: '2024-01-15'
  },
  {
    id: 'HM-2024-001236',
    customer: 'Mike Davis',
    items: 3,
    total: 259.97,
    status: 'shipped',
    date: '2024-01-14'
  }
]

const RECENT_USERS = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex@email.com',
    plan: 'Pro Stats',
    joinDate: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Jessica Chen',
    email: 'jessica@email.com',
    plan: 'Elite Insider',
    joinDate: '2024-01-14',
    status: 'active'
  },
  {
    id: '3',
    name: 'Robert Wilson',
    email: 'robert@email.com',
    plan: 'Free Fan',
    joinDate: '2024-01-13',
    status: 'active'
  }
]

const PRODUCTS = [
  {
    id: '1',
    name: 'Lakers #23 LeBron James Jersey',
    category: 'Jerseys',
    price: 119.99,
    stock: 45,
    status: 'active',
    sales: 234
  },
  {
    id: '2',
    name: 'Warriors Championship Hat',
    category: 'Accessories',
    price: 34.99,
    stock: 0,
    status: 'out_of_stock',
    sales: 89
  },
  {
    id: '3',
    name: 'NBA Logo Hoodie',
    category: 'Apparel',
    price: 69.99,
    stock: 23,
    status: 'active',
    sales: 156
  }
]

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('date')
  const [filterBy, setFilterBy] = useState('all')

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on items:`, selectedItems)
    // In real app, perform bulk action
    setSelectedItems([])
  }

  const handleViewItem = (id: string, type: string) => {
    console.log(`Viewing ${type} with ID:`, id)
    // For now, just show an alert - in real app, navigate to detail view
    alert(`Viewing ${type} details for ID: ${id}`)
  }

  const handleEditItem = (id: string, type: string) => {
    console.log(`Editing ${type} with ID:`, id)
    // For now, just show an alert - in real app, open edit form
    alert(`Opening edit form for ${type} ID: ${id}`)
  }

  const handleDeleteItem = (id: string, type: string) => {
    const confirmed = confirm(`Are you sure you want to delete this ${type}?`)
    if (confirmed) {
      console.log(`Deleting ${type} with ID:`, id)
      // For now, just log - in real app, make API call to delete
      alert(`${type} with ID ${id} has been deleted`)
    }
  }

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
      case 'Elite Insider':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
      case 'Pro Stats':
        return 'bg-gradient-to-r from-kentucky-blue-500 to-kentucky-blue-600 text-white'
      case 'Free Fan':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    }
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your HoopMetrix platform</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  onClick={() => alert('Export functionality coming soon!')}
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
                <Button 
                  className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800 flex items-center gap-2 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                  onClick={() => alert('Add new item functionality coming soon!')}
                >
                  <Plus className="w-4 h-4" />
                  Add New
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
                      <div className="text-2xl font-bold">{DASHBOARD_STATS.totalUsers.toLocaleString()}</div>
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
                      <div className="text-2xl font-bold">{DASHBOARD_STATS.activeSubscriptions.toLocaleString()}</div>
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
                      <div className="text-2xl font-bold">${DASHBOARD_STATS.monthlyRevenue.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">+{DASHBOARD_STATS.growthRate}% from last month</p>
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
                      <div className="text-2xl font-bold">{DASHBOARD_STATS.totalOrders.toLocaleString()}</div>
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
                      <div className="text-2xl font-bold">{DASHBOARD_STATS.growthRate}%</div>
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
                      {RECENT_ORDERS.map((order) => (
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
                      {RECENT_USERS.map((user) => (
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
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>User Management</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select>
                        <SelectTrigger className="w-32">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {RECENT_USERS.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-kentucky-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-kentucky-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getPlanColor(user.plan)}>
                            {user.plan}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewItem(user.id, 'user')}
                              className="hover:bg-kentucky-blue-50 hover:border-kentucky-blue-300 hover:text-kentucky-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditItem(user.id, 'user')}
                              className="hover:bg-kentucky-blue-50 hover:border-kentucky-blue-300 hover:text-kentucky-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Product Management</CardTitle>
                    <Button 
                      className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                      onClick={() => alert('Add product functionality coming soon!')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {PRODUCTS.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-semibold">${product.price}</p>
                            <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                          </div>
                          <Badge className={getStatusColor(product.status)}>
                            {product.status === 'out_of_stock' ? 'Out of Stock' : 'Active'}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditItem(product.id, 'product')}
                              className="hover:bg-kentucky-blue-50 hover:border-kentucky-blue-300 hover:text-kentucky-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteItem(product.id, 'product')}
                              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {RECENT_ORDERS.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-kentucky-blue-100 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-kentucky-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customer} • {order.items} items</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${order.total}</p>
                            <p className="text-sm text-gray-600">{order.date}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewItem(order.id, 'order')}
                              className="hover:bg-kentucky-blue-50 hover:border-kentucky-blue-300 hover:text-kentucky-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditItem(order.id, 'order')}
                              className="hover:bg-kentucky-blue-50 hover:border-kentucky-blue-300 hover:text-kentucky-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Revenue chart placeholder</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">User growth chart placeholder</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}