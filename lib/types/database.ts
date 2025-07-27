export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          abbreviation: string
          city: string
          league: 'NBA' | 'WNBA'
          logo_url: string
          primary_color: string | null
          secondary_color: string | null
          conference: string | null
          division: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          abbreviation: string
          city: string
          league: 'NBA' | 'WNBA'
          logo_url: string
          primary_color?: string | null
          secondary_color?: string | null
          conference?: string | null
          division?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          abbreviation?: string
          city?: string
          league?: 'NBA' | 'WNBA'
          logo_url?: string
          primary_color?: string | null
          secondary_color?: string | null
          conference?: string | null
          division?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          name: string
          team_id: string
          league: 'NBA' | 'WNBA'
          position: string
          jersey_number: number | null
          height: string | null
          weight: string | null
          birth_date: string | null
          photo_url: string
          bio: string | null
          season_stats: Record<string, any> | null
          career_stats: Record<string, any> | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          team_id: string
          league: 'NBA' | 'WNBA'
          position: string
          jersey_number?: number | null
          height?: string | null
          weight?: string | null
          birth_date?: string | null
          photo_url: string
          bio?: string | null
          season_stats?: Record<string, any> | null
          career_stats?: Record<string, any> | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          team_id?: string
          league?: 'NBA' | 'WNBA'
          position?: string
          jersey_number?: number | null
          height?: string | null
          weight?: string | null
          birth_date?: string | null
          photo_url?: string
          bio?: string | null
          season_stats?: Record<string, any> | null
          career_stats?: Record<string, any> | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          original_price: number | null
          image_url: string
          category: string
          stock_quantity: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          original_price?: number | null
          image_url: string
          category: string
          stock_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          original_price?: number | null
          image_url?: string
          category?: string
          stock_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: 'pending' | 'completed' | 'cancelled' | 'shipped'
          shipping_address: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          status?: 'pending' | 'completed' | 'cancelled' | 'shipped'
          shipping_address: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          status?: 'pending' | 'completed' | 'cancelled' | 'shipped'
          shipping_address?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          membership_status: 'free' | 'premium'
          membership_expires_at: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          membership_status?: 'free' | 'premium'
          membership_expires_at?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          membership_status?: 'free' | 'premium'
          membership_expires_at?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'editor'
          permissions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'editor'
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'editor'
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_carts: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          selected_size: string | null
          selected_color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          selected_size?: string | null
          selected_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          selected_size?: string | null
          selected_color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      league_type: 'NBA' | 'WNBA'
      membership_status: 'free' | 'premium'
      order_status: 'pending' | 'completed' | 'cancelled' | 'shipped'
      user_role: 'admin' | 'editor'
    }
  }
}