'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, 
  CreditCard, 
  ShoppingBag, 
  Star, 
  Settings, 
  LogOut,
  Crown,
  Calendar,
  Activity,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/layout/navigation'
import Footer from '@/components/layout/footer'

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
  const { user, loading, signOut, isPremium, isAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteTeam: 'Lakers',
    memberSince: 'January 2024'
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kentucky-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
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
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Here's what's happening with your HoopMetrix account
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
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
                        <h2 className="text-2xl font-bold mb-2">{user.email?.split('@')[0] || 'User'}</h2>
                        <p className="text-white/80 text-sm mb-3">{user.email}</p>
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
                          {isAdmin && (
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
                        <p className="font-bold text-lg">{stats.memberSince}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Orders</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <ShoppingBag className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
                  <p className="text-xs text-gray-600">
                    All time purchases
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Spent</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">${stats.totalSpent}</div>
                  <p className="text-xs text-gray-600">
                    Lifetime value
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Favorite Team</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stats.favoriteTeam}</div>
                  <p className="text-xs text-gray-600">
                    Most viewed team
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Activity</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">42</div>
                  <p className="text-xs text-gray-600">
                    Pages viewed this month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.totalOrders === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-4">No orders yet</p>
                      <Button 
                        onClick={() => router.push('/shop')}
                        className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700"
                      >
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500">Your order history will appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/players')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Browse Players
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/teams')}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    View Teams
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/shop')}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Shop Merchandise
                  </Button>
                  {!isPremium && (
                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                      onClick={() => router.push('/membership')}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Membership Status */}
          {!isPremium && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Crown className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Upgrade to Premium</h3>
                        <p className="text-gray-600 text-sm">Get access to exclusive content, advanced stats, and premium features for just $10!</p>
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                      onClick={() => router.push('/membership')}
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}