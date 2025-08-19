'use client'

import { createClient } from '@/lib/supabase/client'
import { User, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role?: 'user' | 'admin'
  membership_status?: 'free' | 'premium'
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export class AuthClient {
  private supabase = createClient()

  // Sign up new user
  async signUp(email: string, password: string, userData?: { full_name?: string }) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      // Create user profile after successful signup
      if (data.user) {
        await this.createUserProfile(data.user, userData)
      }

      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error as AuthError }
    }
  }

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error as AuthError }
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        // If the error is "Auth session missing", it means the user is already logged out
        // This is not really an error in the context of a logout operation
        if (error.message?.includes('Auth session missing') || error.message?.includes('session_not_found')) {
          // Silently handle - user is already logged out
          return { error: null }
        }
        // For other errors, still log but don't throw
        console.warn('Sign out warning:', error.message)
        return { error: null } // Treat as successful logout anyway
      }
      return { error: null }
    } catch (error) {
      // Catch any other errors and suppress them for logout
      const authError = error as AuthError
      if (authError.message?.includes('Auth session missing') || authError.message?.includes('session_not_found')) {
        return { error: null }
      }
      console.warn('Sign out warning:', authError.message)
      return { error: null } // Always return success for logout
    }
  }

  // Get current user with proper error handling
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        return null
      }
      
      if (!user) return null

      // Return basic user info
      return {
        id: user.id,
        email: user.email || '',
        role: 'user', // Will be updated by context if admin
        membership_status: 'free', // Will be updated by context if premium
        user_metadata: user.user_metadata
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Create user profile
  private async createUserProfile(user: User, userData?: { full_name?: string }) {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: userData?.full_name,
            membership_status: 'free'
          }
        ])

      if (error) {
        console.error('Error creating user profile:', error)
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
    }
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }

  // Subscribe to auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data } = this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getCurrentUser()
        callback(authUser)
      } else {
        callback(null)
      }
    })
    
    return data
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }
}

// Export singleton instance
export const authClient = new AuthClient()