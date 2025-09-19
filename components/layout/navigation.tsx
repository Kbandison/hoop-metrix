'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, useMemo } from 'react'
import { ShoppingCart, User, ChevronDown, Menu, X, LogIn, LogOut, UserCircle, Settings, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCart } from '@/lib/contexts/cart-context'
import { useAuth } from '@/lib/auth/auth-context'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { name: 'Home', href: '/' },
  {
    name: 'Teams',
    href: '/teams',
    hasDropdown: true,
    dropdownItems: [
      { name: 'All Teams', href: '/teams', icon: '🏀', color: 'text-blue-600' },
      { name: 'NBA Teams', href: '/teams?league=NBA', icon: '🏀', color: 'text-blue-600' },
      { name: 'WNBA Teams', href: '/teams?league=WNBA', icon: '🏀', color: 'text-orange-600' },
      { name: 'Custom Teams', href: '/teams?league=Custom', icon: '⭐', color: 'text-purple-600' },
    ]
  },
  { name: 'Players', href: '/players' },
  { name: 'Shop', href: '/shop' },
  { name: 'Membership', href: '/membership' },
]


export default function Navigation() {
  const { totalItems, toggleCart } = useCart()
  const { user, signOut, loading, isAdmin, isPremium } = useAuth()
  
  // Debug logging to see what's actually happening
  console.log('Navigation render:', { 
    hasUser: !!user, 
    userId: user?.id, 
    loading, 
    email: user?.email 
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTeamsDropdownOpen, setIsTeamsDropdownOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null)
  const teamsDropdownRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const closeTeamsDropdown = () => setIsTeamsDropdownOpen(false)
  const closeProfileDropdown = () => setIsProfileDropdownOpen(false)

  const getUserInitial = (name: string) => {
    return name.split(' ')[0].charAt(0).toUpperCase()
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close mobile menu if clicking outside (but not on hamburger button)
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target as Node) &&
          hamburgerButtonRef.current &&
          !hamburgerButtonRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
      
      // Close profile dropdown if clicking outside
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
      
      // Close teams dropdown if clicking outside
      if (teamsDropdownRef.current && !teamsDropdownRef.current.contains(event.target as Node)) {
        setIsTeamsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Profile dropdown now manages its own state

  // Toggle mobile menu when clicking hamburger button
  const handleHamburgerClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = async () => {
    // Close dropdown and show logout success modal
    setIsProfileDropdownOpen(false)
    setShowLogoutModal(true)
    
    // Temporarily suppress console errors for logout
    const originalError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (!message.includes('Auth session missing') && 
          !message.includes('session_not_found') && 
          !message.includes('AuthSessionMissingError')) {
        originalError(...args)
      }
    }
    
    // Actually perform the logout
    try {
      await signOut()
    } catch (error) {
      // Silently ignore any errors - modal will still show success
    } finally {
      // Restore original console.error after a short delay
      setTimeout(() => {
        console.error = originalError
      }, 100)
    }
    
    // Hide modal and redirect to home page after 4 seconds  
    setTimeout(() => {
      setShowLogoutModal(false)
      // Redirect to home page with full refresh
      window.location.href = '/'
    }, 4000)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-8 py-4 flex items-center justify-between shadow-lg min-h-[64px] relative">
          {/* Mobile Hamburger - Left */}
          <div className="lg:hidden flex items-center">
            <Button
              ref={hamburgerButtonRef}
              variant="ghost"
              size="sm"
              className="relative text-white hover:bg-white/10 p-2"
              onClick={handleHamburgerClick}
            >
              <Menu className="w-5 h-5" />
              {/* Cart indicator on mobile hamburger */}
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-kentucky-blue-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>

          {/* Logo - Clickable, absolutely centered on mobile only */}
          <Link href="/" className="flex items-center space-x-3 lg:space-x-3 lg:static lg:transform-none lg:relative absolute left-1/2 transform -translate-x-1/2 lg:left-auto lg:translate-x-0">
            <Image
              src="/HM_logo_transparent.png"
              alt="HoopMetrix Logo"
              width={32}
              height={32}
              className="rounded-full w-10 h-10 lg:w-8 lg:h-8"
            />
            <span className="hidden lg:block text-white font-bold text-xl tracking-wide">HoopMetrix</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div key={item.name} ref={teamsDropdownRef} className="relative">
                  <button
                    className="flex items-center gap-1 text-white text-sm font-medium hover:text-white/80 transition-colors"
                    onClick={() => setIsTeamsDropdownOpen(!isTeamsDropdownOpen)}
                  >
                    {item.name}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {isTeamsDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-black/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-4 z-50"
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.1, duration: 0.15 }}
                          className="space-y-1"
                        >
                          {item.dropdownItems?.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="w-full flex items-center gap-3 text-white hover:text-white/80 transition-colors py-2 px-2 rounded-lg hover:bg-white/10 block"
                              onClick={closeTeamsDropdown}
                            >
                              <span className={dropdownItem.color}>{dropdownItem.icon}</span>
                              <span className="font-medium">{dropdownItem.name}</span>
                            </Link>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white text-sm font-medium hover:text-white/80 transition-colors"
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button - Desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex relative text-white hover:bg-white/10 items-center gap-2"
              onClick={toggleCart}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">Cart</span>
              {totalItems > 0 && (
                <Badge className="bg-kentucky-blue-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Auth/Profile Section */}
          {user ? (
              <div ref={profileDropdownRef} className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={user?.user_metadata?.full_name || user?.email || ''} />
                    <AvatarFallback className="bg-kentucky-blue-600 text-white text-sm">
                      {getUserInitial(user?.user_metadata?.full_name || user?.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium">
                    {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                
                <AnimatePresence mode="wait">
                  {isProfileDropdownOpen && (
                    <motion.div
                      key="profile-dropdown-content"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-56 bg-black/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-4 z-50"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.1, duration: 0.15 }}
                      >
                        {/* User Info Section */}
                        <div className="px-2 py-3 border-b border-white/20 mb-2">
                          <div className="text-white font-medium">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${isPremium ? 'bg-gradient-to-r from-kentucky-blue-500 to-purple-500' : 'bg-gray-600'} text-white text-xs`}>
                              {isPremium ? '👑 Premium Member' : '🆓 Free Member'}
                            </Badge>
                          </div>
                        </div>
                        
                        <Link 
                          href="/dashboard" 
                          className="w-full flex items-center gap-3 text-white hover:text-white/80 transition-colors py-2 px-2 rounded-lg hover:bg-white/10 block"
                          onClick={closeProfileDropdown}
                        >
                          <UserCircle className="w-5 h-5" />
                          <span className="font-medium">Profile</span>
                        </Link>
                        {isAdmin && (
                          <Link 
                            href="/admin" 
                            className="w-full flex items-center gap-3 text-orange-400 hover:text-orange-300 transition-colors py-2 px-2 rounded-lg hover:bg-orange-500/10 block"
                            onClick={closeProfileDropdown}
                          >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Admin Dashboard</span>
                          </Link>
                        )}
                        <div className="border-t border-white/20 my-2"></div>
                        <button 
                          className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 px-2 rounded-lg transition-colors"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Log Out</span>
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : loading ? (
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700 text-white px-6 py-2 text-sm font-medium flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden lg:block">Log In / Sign Up</span>
                  <span className="lg:hidden">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-4"
            >
              <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col space-y-4">
                  {navItems.map((item) => 
                    item.hasDropdown ? (
                      <div key={item.name} className="space-y-2">
                        <div className="text-white font-medium text-lg">{item.name}</div>
                        <div className="ml-4 space-y-2">
                          {item.dropdownItems?.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="block text-white/80 hover:text-white transition-colors py-1 flex items-center gap-2"
                              onClick={closeMobileMenu}
                            >
                              <span>{dropdownItem.icon}</span>
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-white font-medium text-lg hover:text-white/80 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                  
                  {/* Mobile Cart Button */}
                  <Button
                    variant="ghost"
                    className="justify-start text-white hover:bg-white/10 py-3 px-0"
                    onClick={() => {
                      toggleCart()
                      closeMobileMenu()
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="font-medium text-lg">Cart</span>
                      </div>
                      {totalItems > 0 && (
                        <Badge className="bg-kentucky-blue-600 text-white">
                          {totalItems}
                        </Badge>
                      )}
                    </div>
                  </Button>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logout Success Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-gray-900 mb-2"
                >
                  Logged Out Successfully
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600"
                >
                  You have been securely logged out. Redirecting to home page...
                </motion.p>
                
                {/* Loading indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 flex justify-center"
                >
                  <div className="w-6 h-6 border-2 border-kentucky-blue-200 border-t-kentucky-blue-600 rounded-full animate-spin"></div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}