import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <Image
                src="/HM_logo_transparent.png"
                alt="HoopMetrix Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-bold text-2xl">Hoop Metrix</span>
            </div>
            <p className="text-gray-400 max-w-md mb-6">
              The ultimate basketball database featuring comprehensive player profiles, team statistics, and exclusive merchandise.
            </p>
            <div className="flex space-x-4">
              <Badge variant="outline" className="border-gray-700 text-gray-300">NBA</Badge>
              <Badge variant="outline" className="border-gray-700 text-gray-300">WNBA</Badge>
              <Badge variant="outline" className="border-gray-700 text-gray-300">Statistics</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/players" className="text-gray-400 hover:text-white transition-colors">Players</Link></li>
              <li><Link href="/teams" className="text-gray-400 hover:text-white transition-colors">Teams</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Shop</Link></li>
              <li><Link href="/membership" className="text-gray-400 hover:text-white transition-colors">Membership</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
            
            {/* Admin Panel Access */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h4 className="text-sm font-semibold mb-3 text-gray-400">Admin Access</h4>
              <Link href="/admin">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Hoop Metrix. All rights reserved. Built with passion for basketball.
          </p>
        </div>
      </div>
    </footer>
  )
}