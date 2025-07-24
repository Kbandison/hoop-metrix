'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/contexts/cart-context'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Players', href: '/players' },
  { name: 'Teams', href: '/teams' },
  { name: 'Shop', href: '/shop' },
  { name: 'Membership', href: '/membership' },
]

export default function Navigation() {
  const { totalItems, toggleCart } = useCart()

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-full px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image
              src="/HM_logo_transparent.png"
              alt="HoopMetrix Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-white font-bold text-xl tracking-wide">HoopMetrix</span>
          </div>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white text-sm font-medium hover:text-white/80 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-white hover:bg-white/10"
              onClick={toggleCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-kentucky-blue-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Account Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <User className="w-5 h-5" />
            </Button>

            {/* CTA Button */}
            <Button className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700 text-white px-6 py-2 text-sm font-medium">
              Join us today
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}