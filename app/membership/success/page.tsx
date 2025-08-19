'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Crown, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // Verify the session with your backend
      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSessionData(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Success Icon */}
            <motion.div
              className="inline-block mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Welcome to HoopMetrix Premium! 🏀
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Your subscription is now active. You have access to all premium features!
            </motion.p>

            {/* Premium Features */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-slate-800/50 border-kentucky-blue-500/30">
                <CardHeader className="text-center pb-4">
                  <Crown className="w-8 h-8 text-kentucky-blue-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Premium Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Complete player profiles</li>
                    <li>• Advanced analytics</li>
                    <li>• Historical data access</li>
                    <li>• Ad-free experience</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-kentucky-blue-500/30">
                <CardHeader className="text-center pb-4">
                  <Users className="w-8 h-8 text-kentucky-blue-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Exclusive Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Insider articles</li>
                    <li>• Premium insights</li>
                    <li>• Priority support</li>
                    <li>• Early feature access</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Link href="/players">
                <Button 
                  size="lg" 
                  className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700 text-white px-8 py-3"
                >
                  Explore Players
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/50 text-white hover:bg-white/20 hover:text-white px-8 py-3 bg-white/10"
                >
                  Manage Account
                </Button>
              </Link>
            </motion.div>

            {/* Session Details (if available) */}
            {sessionData && (
              <motion.div
                className="mt-8 p-4 bg-slate-800/60 rounded-lg border border-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <p className="text-gray-200 text-sm">
                  Order ID: {sessionData.payment_intent || sessionId}
                </p>
                <p className="text-gray-200 text-sm mt-1">
                  A confirmation email has been sent to your email address.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
    </div>
  )
}

export default function MembershipSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}