'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, User, ChevronDown, Menu, X, LogIn, LogOut, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
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
  const { user, signOut, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  
  const getUserInitial = (name: string) => {
    return name.split(' ')[0].charAt(0).toUpperCase()
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-8 py-4 flex items-center justify-between shadow-lg">
          {/* Mobile Hamburger - Left */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-white hover:bg-white/10 p-2"
              onClick={toggleMobileMenu}
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

          {/* Logo - Clickable, centered on mobile */}
          <Link href="/" className="flex items-center space-x-3 lg:space-x-3">
            <Image
              src="/HM_logo_transparent.png"
              alt="HoopMetrix Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="hidden lg:block text-white font-bold text-xl tracking-wide">HoopMetrix</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-white text-sm font-medium hover:text-white/80 transition-colors">
                    {item.name}
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48 bg-white text-gray-900 border border-gray-200 shadow-lg">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <DropdownMenuItem key={dropdownItem.name} asChild>
                        <Link href={dropdownItem.href} className="w-full flex items-center gap-2 text-gray-900 hover:bg-gray-100">
                          <span className={dropdownItem.color}>{dropdownItem.icon}</span>
                          {dropdownItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-white hover:bg-white/10 rounded-lg p-2 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.full_name || user.email || ''} />
                    <AvatarFallback className="bg-kentucky-blue-600 text-white text-sm">
                      {getUserInitial(user.user_metadata?.full_name || user.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium">
                    {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white text-gray-900 border border-gray-200 shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full flex items-center gap-2 text-gray-900 hover:bg-gray-100">
                      <UserCircle className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

                  {/* Mobile Auth Section */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-white mb-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.full_name || user.email || ''} />
                            <AvatarFallback className="bg-kentucky-blue-600 text-white text-sm">
                              {getUserInitial(user.user_metadata?.full_name || user.email || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-lg">
                            {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                          </span>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 text-white hover:text-white/80 transition-colors py-2"
                          onClick={closeMobileMenu}
                        >
                          <UserCircle className="w-5 h-5" />
                          <span className="font-medium text-lg">Profile</span>
                        </Link>
                        <Button
                          variant="ghost"
                          className="justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 px-0 w-full"
                          onClick={() => {
                            handleLogout()
                            closeMobileMenu()
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium text-lg">Log Out</span>
                          </div>
                        </Button>
                      </div>
                    ) : (
                      <Link href="/auth/login" onClick={closeMobileMenu}>
                        <Button className="w-full bg-kentucky-blue-600 hover:bg-kentucky-blue-700 text-white py-3 text-lg font-medium flex items-center justify-center gap-3">
                          <LogIn className="w-5 h-5" />
                          Log In / Sign Up
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}