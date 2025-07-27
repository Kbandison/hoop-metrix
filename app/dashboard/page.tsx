'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  ShoppingBag,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Crown,
  Star,
  Download,
  Trash2,
  LogOut,
  Activity,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

// Types for account data
interface AccountData {
  profile: {
    name: string
    email: string
    phone: string
    address: string
    joinDate: string
    avatar: string
  }
  subscription: {
    plan: string
    status: string
    nextBilling: string | null
    price: number
    interval: string
  }
  stats: {
    ordersPlaced: number
    totalSpent: number
    memberSince: string
  }
  orders: Array<{
    id: string
    date: string
    total: number
    status: string
    items: number
    products?: string
  }>
  isAdmin: boolean
}

// Default/loading data
const DEFAULT_DATA: AccountData = {
  profile: {
    name: 'Loading...',
    email: 'Loading...',
    phone: '',
    address: '',
    joinDate: '',
    avatar: '/placeholder-avatar.jpg'
  },
  subscription: {
    plan: 'Free',
    status: 'inactive',
    nextBilling: null,
    price: 0,
    interval: 'monthly'
  },
  stats: {
    ordersPlaced: 0,
    totalSpent: 0,
    memberSince: ''
  },
  orders: [],
  isAdmin: false
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [accountData, setAccountData] = useState<AccountData>(DEFAULT_DATA)
  const [formData, setFormData] = useState(DEFAULT_DATA.profile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  })

  // Fetch account data
  const fetchAccountData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/account')
      if (!response.ok) {
        throw new Error('Failed to fetch account data')
      }
      const data = await response.json()
      setAccountData(data)
      setFormData(data.profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account data')
      console.error('Error fetching account data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccountData()
  }, [])

  const handleSignOut = async () => {
    // TODO: Implement proper sign out
    window.location.href = '/auth/login'
  }

  const handleSave = () => {
    setIsEditing(false)
    // TODO: Implement profile save functionality
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData(accountData.profile)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'HoopMetrix Premium':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-900 border-0 shadow-lg'
      case 'Free':
        return 'bg-white/20 text-white border-white/30 backdrop-blur-sm'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
                <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kentucky-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
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
            <p className="text-red-600 mb-4">Error loading dashboard</p>
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

  const isPremium = accountData.subscription.status === 'active'

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
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {accountData.profile.name !== 'Loading...' ? accountData.profile.name.split(' ')[0] : 'User'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Here's what's happening with your HoopMetrix account
                </p>
              </div>
              <div className="flex items-center gap-3">
                {accountData.isAdmin && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const baseUrl = typeof window !== 'undefined' && window.location.origin
                        ? window.location.origin
                        : 'http://localhost:3000'
                      window.location.href = `${baseUrl}/admin`
                    }}
                    className="flex items-center gap-2 hover:bg-kentucky-blue-50 hover:border-kentucky-blue-300 hover:text-kentucky-blue-600"
                  >
                    <Crown className="w-4 h-4" />
                    Admin Panel
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>

          {/* User Info Card */}
          <motion.div
            className="mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-kentucky-blue-600 via-kentucky-blue-700 to-blue-800 text-white shadow-2xl border-0 overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('/basketball-pattern.svg')] bg-repeat opacity-20"></div>
                </div>
                
                <CardContent className="p-8 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <User className="w-10 h-10 text-white" />
                        </div>
                        {isPremium && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-yellow-900" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{accountData.profile.name}</h2>
                        <p className="text-white/80 text-sm mb-3">{accountData.profile.email}</p>
                        <div className="flex items-center gap-3">
                          <Badge className={isPremium 
                            ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-900 border-0 shadow-lg" 
                            : "bg-white/20 text-white border-white/30 backdrop-blur-sm"
                          }>
                            {isPremium ? (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                Premium Member
                              </>
                            ) : (
                              'Free Member'
                            )}
                          </Badge>
                          {accountData.isAdmin && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <p className="text-white/80 text-sm mb-1">Member since</p>
                        <p className="font-bold text-lg">{accountData.stats.memberSince}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 lg:max-w-5xl lg:mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Orders Placed</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{accountData.stats.ordersPlaced}</div>
                  <p className="text-xs text-gray-500">Total orders placed</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Spent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">${accountData.stats.totalSpent.toFixed(2)}</div>
                  <p className="text-xs text-gray-500">Lifetime spending</p>
                </CardContent>
              </Card>
            </motion.div>


            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Subscription Status</CardTitle>
                  <Crown className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{isPremium ? 'Premium' : 'Free'}</div>
                  <p className="text-xs text-gray-500">{accountData.subscription.plan}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-white border shadow-sm">
                <TabsTrigger value="overview" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-kentucky-blue-600 data-[state=active]:!text-white">
                  <Activity className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-kentucky-blue-600 data-[state=active]:!text-white">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-kentucky-blue-600 data-[state=active]:!text-white">
                  <ShoppingBag className="w-4 h-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-kentucky-blue-600 data-[state=active]:!text-white">
                  <CreditCard className="w-4 h-4" />
                  Subscription
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 !text-gray-700 data-[state=active]:bg-kentucky-blue-600 data-[state=active]:!text-white">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                          <ShoppingBag className="w-5 h-5" />
                          Recent Orders
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {accountData.orders.length > 0 ? accountData.orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{order.id}</p>
                              <p className="text-sm text-gray-600">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        )) : (
                          <p className="text-gray-500 text-center py-4">No recent orders</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                          <Star className="w-5 h-5" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button 
                          className="w-full justify-start" 
                          variant="ghost"
                          onClick={() => setActiveTab('subscription')}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="ghost"
                          onClick={() => setActiveTab('profile')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="ghost"
                          onClick={() => setActiveTab('orders')}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          View Order History
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="ghost"
                          onClick={() => window.location.href = '/shop'}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Shop Products
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900">Personal Information</CardTitle>
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={handleSave} size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gray-900">Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {accountData.orders.length > 0 ? accountData.orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-kentucky-blue-100 rounded-full flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-kentucky-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{order.id}</p>
                              <p className="text-sm text-gray-600">{order.date} • {order.items} items</p>
                              {order.products && (
                                <p className="text-xs text-gray-500">{order.products}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-center py-8">No orders yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gray-900">Current Subscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-kentucky-blue-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-kentucky-blue-100 rounded-full flex items-center justify-center">
                          {isPremium ? (
                            <Crown className="w-6 h-6 text-kentucky-blue-600" />
                          ) : (
                            <User className="w-6 h-6 text-kentucky-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {accountData.subscription.plan}
                          </h3>
                          <p className="text-gray-600">
                            ${accountData.subscription.price.toFixed(2)}/{accountData.subscription.interval}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(accountData.subscription.status)}>
                          {accountData.subscription.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {accountData.subscription.nextBilling ? `Next billing: ${accountData.subscription.nextBilling}` : 'No active subscription'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {accountData.subscription.status === 'active' ? (
                        <>
                          <Button variant="outline" onClick={async () => {
                            try {
                              const response = await fetch('/api/manage-subscription', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  customerId: 'cus_example',
                                  action: 'manage',
                                }),
                              })
                              const { url } = await response.json()
                              if (url) window.location.href = url
                            } catch (error) {
                              console.error('Error:', error)
                              alert('Something went wrong. Please try again.')
                            }
                          }}>
                            Manage Subscription
                          </Button>
                          <Button variant="outline" onClick={async () => {
                            if (!confirm('Are you sure you want to cancel your subscription?')) return
                            try {
                              const response = await fetch('/api/manage-subscription', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  customerId: 'cus_example',
                                  action: 'cancel',
                                }),
                              })
                              const result = await response.json()
                              if (result.success) {
                                alert(result.message)
                                window.location.reload()
                              }
                            } catch (error) {
                              console.error('Error:', error)
                              alert('Something went wrong. Please try again.')
                            }
                          }}>
                            Cancel Subscription
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => window.location.href = '/membership'}>
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </Button>
                      )}
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>


              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-gray-900">Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked: boolean) => setNotifications({...notifications, email: checked})}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">SMS Notifications</p>
                          <p className="text-sm text-gray-600">Receive updates via text message</p>
                        </div>
                        <Switch
                          checked={notifications.sms}
                          onCheckedChange={(checked: boolean) => setNotifications({...notifications, sms: checked})}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Push Notifications</p>
                          <p className="text-sm text-gray-600">Receive browser notifications</p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked: boolean) => setNotifications({...notifications, push: checked})}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-gray-900">Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                        />
                      </div>

                      <Button>Update Password</Button>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-gray-600 mb-4 text-sm">
                          Add an extra layer of security to your account
                        </p>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

    </div>
  )
}