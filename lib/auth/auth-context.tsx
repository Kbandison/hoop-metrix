'use client'

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react'
import { authClient, AuthUser } from './auth-client'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ user: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ user: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
  refreshUser: () => Promise<void>
  isAdmin: boolean
  isPremium: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Debounced user details fetching to prevent rapid updates
  const fetchUserDetailsDebounced = useMemo(() => {
    let timeoutId: NodeJS.Timeout
    let isProcessing = false

    return async (basicUser: AuthUser) => {
      // Clear any existing timeout
      clearTimeout(timeoutId)
      
      // If already processing, queue for later
      if (isProcessing) {
        timeoutId = setTimeout(() => fetchUserDetailsDebounced(basicUser), 100)
        return
      }

      isProcessing = true

      try {
        const response = await fetch('/api/auth/user')
        
        if (response.ok) {
          const userData = await response.json()
          setUser(prevUser => {
            // Only update if the user is still the same AND the data is actually different
            if (prevUser?.id === basicUser.id) {
              const newMembershipStatus = userData.user?.membership_status || 'free'
              const newRole = userData.user?.role || 'user'
              
              // Don't update if the values are the same (prevent unnecessary re-renders)
              if (prevUser.membership_status === newMembershipStatus && prevUser.role === newRole) {
                return prevUser
              }
              
              return {
                ...basicUser,
                role: newRole,
                membership_status: newMembershipStatus
              }
            }
            return prevUser
          })
        } else {
          // If API fails, use basic user with defaults
          setUser(prevUser => {
            if (prevUser?.id === basicUser.id) {
              return {
                ...basicUser,
                role: 'user',
                membership_status: 'free'
              }
            }
            return prevUser
          })
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error)
        // On error, use basic user with defaults
        setUser(prevUser => {
          if (prevUser?.id === basicUser.id) {
            return {
              ...basicUser,
              role: 'user',
              membership_status: 'free'
            }
          }
          return prevUser
        })
      } finally {
        isProcessing = false
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Get initial user - simple and fast
    const initAuth = async () => {
      try {
        const user = await authClient.getCurrentUser()
        
        if (mounted) {
          if (user) {
            // Set user with defaults immediately to prevent layout shifts
            setUser({
              ...user,
              role: 'user',
              membership_status: 'free'
            })
            setLoading(false)
            
            // Then fetch detailed user info in background
            fetchUserDetailsDebounced(user)
          } else {
            setUser(null)
            setLoading(false)
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

    initAuth()

    // Listen for auth changes
    const subscription = authClient.onAuthStateChange((user) => {
      if (mounted) {
        if (user) {
          // Set user with defaults immediately
          setUser({
            ...user,
            role: 'user',
            membership_status: 'free'
          })
          setLoading(false)
          
          // Then fetch detailed info
          fetchUserDetailsDebounced(user)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const refreshUser = async () => {
    try {
      const currentUser = await authClient.getCurrentUser()
      if (currentUser) {
        await fetchUserDetailsDebounced(currentUser)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value = {
    user,
    loading,
    signUp: authClient.signUp.bind(authClient),
    signIn: authClient.signIn.bind(authClient),
    signOut: authClient.signOut.bind(authClient),
    resetPassword: authClient.resetPassword.bind(authClient),
    updatePassword: authClient.updatePassword.bind(authClient),
    refreshUser,
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