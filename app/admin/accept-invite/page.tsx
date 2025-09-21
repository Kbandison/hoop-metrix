'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'

export default function AcceptInvitePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'redirect'>('loading')
  const [message, setMessage] = useState('')
  const [userExists, setUserExists] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const role = searchParams.get('role') as 'admin' | 'editor'

  useEffect(() => {
    const processInvitation = async () => {
      if (!token || !email || !role) {
        setStatus('error')
        setMessage('Invalid invitation link. Please check your email or contact an administrator.')
        return
      }

      try {
        // Check if user exists and is logged in
        if (user) {
          if (user.email !== email) {
            setStatus('error')
            setMessage(`This invitation is for ${email}, but you're logged in as ${user.email}. Please log out and try again.`)
            return
          }

          // User is logged in with correct email, assign admin role
          const response = await fetch('/api/admin/assign-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, role })
          })

          if (response.ok) {
            setStatus('success')
            setMessage(`Successfully assigned ${role} role! You can now access the admin dashboard.`)
            setTimeout(() => {
              router.push('/admin')
            }, 3000)
          } else {
            const errorData = await response.json()
            setStatus('error')
            setMessage(errorData.error || 'Failed to assign admin role')
          }
        } else {
          // User not logged in, check if account exists
          const checkResponse = await fetch(`/api/admin/assign-role?email=${encodeURIComponent(email)}`)
          
          if (checkResponse.ok) {
            const userData = await checkResponse.json()
            setUserExists(!!userData.user)
            setStatus('redirect')
            setMessage(userData.user ? 
              'Please log in to your existing account to accept this admin invitation.' :
              'Please create an account with this email address to accept this admin invitation.'
            )
          } else {
            setUserExists(false)
            setStatus('redirect')
            setMessage('Please create an account with this email address to accept this admin invitation.')
          }
        }
      } catch (error) {
        console.error('Error processing invitation:', error)
        setStatus('error')
        setMessage('An error occurred while processing your invitation. Please try again.')
      }
    }

    processInvitation()
  }, [token, email, role, user, router])

  const handleAuthRedirect = () => {
    const redirectUrl = `/admin/accept-invite?token=${token}&email=${email}&role=${role}`
    if (userExists) {
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`)
    } else {
      router.push(`/auth/signup?email=${encodeURIComponent(email!)}&redirect=${encodeURIComponent(redirectUrl)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kentucky-blue-50 to-kentucky-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-kentucky-blue-500 to-kentucky-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Admin Invitation
            </CardTitle>
            <p className="text-gray-600">HoopMetrix Admin Access</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === 'loading' && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-kentucky-blue-600 mb-4" />
                <p className="text-gray-600">Processing your invitation...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500">Redirecting to admin dashboard...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-4">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <Button 
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800"
                >
                  Go to Homepage
                </Button>
              </div>
            )}

            {status === 'redirect' && (
              <div className="text-center py-4">
                <Shield className="w-16 h-16 text-kentucky-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {userExists ? 'Login Required' : 'Account Required'}
                </h3>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="space-y-3">
                  <div className="bg-kentucky-blue-50 p-4 rounded-lg border border-kentucky-blue-200">
                    <p className="text-sm text-kentucky-blue-800">
                      <strong>Email:</strong> {email}
                    </p>
                    <p className="text-sm text-kentucky-blue-800">
                      <strong>Role:</strong> {role?.charAt(0).toUpperCase()}{role?.slice(1)}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleAuthRedirect}
                    className="w-full bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800"
                  >
                    {userExists ? 'Login to Accept Invitation' : 'Create Account & Accept Invitation'}
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center text-xs text-gray-500 border-t pt-4">
              This invitation is valid for 24 hours
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}