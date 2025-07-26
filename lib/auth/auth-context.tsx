'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authClient, AuthUser } from './auth-client'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ user: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ user: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
  isAdmin: boolean
  isPremium: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial user - simple and fast
    const initAuth = async () => {
      try {
        const user = await authClient.getCurrentUser()
        
        if (mounted) {
          setUser(user)
          setLoading(false)
          
          // After basic auth loads, fetch detailed user info in background
          if (user) {
            fetchUserDetails(user)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    // Fetch detailed user info separately
    const fetchUserDetails = async (basicUser: AuthUser) => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const userData = await response.json()
          if (mounted) {
            setUser({
              ...basicUser,
              role: userData.user?.role || 'user',
              membership_status: userData.user?.membership_status || 'free'
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error)
      }
    }

    initAuth()

    // Listen for auth changes
    const subscription = authClient.onAuthStateChange((user) => {
      if (mounted) {
        setUser(user)
        setLoading(false)
        if (user) {
          fetchUserDetails(user)
        }
      }
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    signUp: authClient.signUp.bind(authClient),
    signIn: authClient.signIn.bind(authClient),
    signOut: authClient.signOut.bind(authClient),
    resetPassword: authClient.resetPassword.bind(authClient),
    updatePassword: authClient.updatePassword.bind(authClient),
    isAdmin: user?.role === 'admin',
    isPremium: user?.membership_status === 'premium'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return { user: null, loading: true }
  }
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return { user, loading: false }
}

export function useRequireAdmin() {
  const { user, loading, isAdmin } = useAuth()
  
  if (loading) {
    return { user: null, loading: true }
  }
  
  if (!user || !isAdmin) {
    throw new Error('Admin access required')
  }
  
  return { user, loading: false }
}