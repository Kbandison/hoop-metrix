import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

// Mock products data
const mockProducts = [
  {
    name: 'Lakers #23 LeBron James Jersey',
    description: 'Official NBA Lakers jersey featuring LeBron James #23. Made with premium materials for comfort and durability.',
    price: 119.99,
    category: 'Jerseys',
    stock_quantity: 45,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'Golden State Warriors Championship Hat',
    description: 'Celebrate the Warriors championship with this premium fitted cap. Features embroidered team logo.',
    price: 34.99,
    category: 'Accessories',
    stock_quantity: 78,
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'NBA Logo Hoodie',
    description: 'Classic NBA logo hoodie in premium cotton blend. Perfect for game day or casual wear.',
    price: 69.99,
    category: 'Apparel',
    stock_quantity: 23,
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'Boston Celtics #0 Jayson Tatum Jersey',
    description: 'Official Celtics jersey featuring rising star Jayson Tatum. Authentic NBA merchandise.',
    price: 109.99,
    category: 'Jerseys',
    stock_quantity: 32,
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'Basketball Training Shorts',
    description: 'Professional-grade basketball shorts with moisture-wicking technology. Perfect for training and games.',
    price: 39.99,
    category: 'Apparel',
    stock_quantity: 67,
    image_url: 'https://images.unsplash.com/photo-1506629905607-53e91acd1d3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'WNBA Las Vegas Aces Jersey',
    description: 'Official WNBA Las Vegas Aces jersey. Support women\'s basketball with this premium jersey.',
    price: 89.99,
    category: 'Jerseys',
    stock_quantity: 19,
    image_url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'Basketball Sneakers - Court Pro',
    description: 'High-performance basketball sneakers with superior grip and ankle support. Professional quality.',
    price: 159.99,
    category: 'Footwear',
    stock_quantity: 41,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'NBA Playoff Commemorative Ball',
    description: 'Official NBA playoff commemorative basketball. Limited edition collectible item.',
    price: 79.99,
    category: 'Collectibles',
    stock_quantity: 15,
    image_url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'Team Logo Water Bottle',
    description: 'Insulated water bottle featuring your favorite team logo. Keeps drinks cold for 24 hours.',
    price: 24.99,
    category: 'Accessories',
    stock_quantity: 93,
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    name: 'Championship Ring Replica',
    description: 'High-quality replica of NBA championship ring. Perfect for any basketball fan\'s collection.',
    price: 199.99,
    category: 'Collectibles',
    stock_quantity: 8,
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  }
]

// Mock users data
const mockUsers = [
  {
    email: 'alex.thompson@email.com',
    full_name: 'Alex Thompson',
    membership_status: 'premium',
    password: 'password123'
  },
  {
    email: 'jessica.chen@email.com',
    full_name: 'Jessica Chen',
    membership_status: 'premium',
    password: 'password123'
  },
  {
    email: 'michael.rodriguez@email.com',
    full_name: 'Michael Rodriguez',
    membership_status: 'free',
    password: 'password123'
  },
  {
    email: 'sarah.johnson@email.com',
    full_name: 'Sarah Johnson',
    membership_status: 'premium',
    password: 'password123'
  },
  {
    email: 'david.kim@email.com',
    full_name: 'David Kim',
    membership_status: 'free',
    password: 'password123'
  },
  {
    email: 'emma.watson@email.com',
    full_name: 'Emma Watson',
    membership_status: 'premium',
    password: 'password123'
  },
  {
    email: 'james.wilson@email.com',
    full_name: 'James Wilson',
    membership_status: 'free',
    password: 'password123'
  },
  {
    email: 'lisa.brown@email.com',
    full_name: 'Lisa Brown',
    membership_status: 'premium',
    password: 'password123'
  }
]

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient() // Use service client for admin operations
    
    let results = {
      products: 0,
      users: 0,
      orders: 0,
      admin: false,
      errors: [] as string[]
    }

    // 1. Insert Products
    console.log('📦 Adding products...')
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .insert(mockProducts)
        .select()

      if (productsError) {
        results.errors.push(`Products error: ${productsError.message}`)
      } else {
        results.products = products.length
        console.log(`✅ Added ${products.length} products`)
      }
    } catch (error) {
      results.errors.push(`Products exception: ${error}`)
    }

    // 2. Create Users
    console.log('👥 Creating users...')
    const createdUsers = []

    for (const userData of mockUsers) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: { 
            full_name: userData.full_name 
          }
        })

        if (authError) {
          results.errors.push(`Auth user ${userData.email}: ${authError.message}`)
          continue
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            membership_status: userData.membership_status
          }])

        if (profileError) {
          results.errors.push(`Profile ${userData.email}: ${profileError.message}`)
          continue
        }

        createdUsers.push({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          membership_status: userData.membership_status
        })
      } catch (error) {
        results.errors.push(`User exception ${userData.email}: ${error}`)
      }
    }

    results.users = createdUsers.length
    console.log(`✅ Created ${createdUsers.length} users`)

    // 3. Create sample orders (simple ones)
    console.log('🛒 Creating sample orders...')
    try {
      if (createdUsers.length > 0) {
        const sampleOrders = [
          {
            user_id: createdUsers[0].id,
            total_amount: 149.98,
            status: 'completed'
          },
          {
            user_id: createdUsers[1].id,
            total_amount: 89.99,
            status: 'processing'
          },
          {
            user_id: createdUsers[2].id,
            total_amount: 259.97,
            status: 'shipped'
          }
        ]

        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .insert(sampleOrders)
          .select()

        if (ordersError) {
          results.errors.push(`Orders error: ${ordersError.message}`)
        } else {
          results.orders = orders.length
          console.log(`✅ Created ${orders.length} orders`)
        }
      }
    } catch (error) {
      results.errors.push(`Orders exception: ${error}`)
    }

    // 4. Create admin user
    console.log('👑 Creating admin user...')
    try {
      const adminEmail = 'admin@hoopmetrix.com'
      const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'admin123!',
        email_confirm: true,
        user_metadata: { 
          full_name: 'HoopMetrix Admin' 
        }
      })

      if (adminAuthError) {
        results.errors.push(`Admin auth: ${adminAuthError.message}`)
      } else {
        // Create admin profile
        const { error: adminProfileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: adminAuth.user.id,
            email: adminEmail,
            full_name: 'HoopMetrix Admin',
            membership_status: 'premium'
          }])

        if (adminProfileError) {
          results.errors.push(`Admin profile: ${adminProfileError.message}`)
        } else {
          // Make user admin
          const { error: adminUserError } = await supabase
            .from('admin_users')
            .insert([{
              user_id: adminAuth.user.id,
              role: 'admin'
            }])

          if (adminUserError) {
            results.errors.push(`Admin user: ${adminUserError.message}`)
          } else {
            results.admin = true
            console.log('✅ Created admin user: admin@hoopmetrix.com / admin123!')
          }
        }
      }
    } catch (error) {
      results.errors.push(`Admin exception: ${error}`)
    }

    return NextResponse.json({
      message: 'Database seeding completed!',
      results,
      summary: {
        products: results.products,
        users: results.users,
        orders: results.orders,
        admin: results.admin ? 'Created admin@hoopmetrix.com' : 'Failed to create admin',
        errors: results.errors.length
      }
    })

  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error },
      { status: 500 }
    )
  }
}