import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addFreeProduct() {
  console.log('Adding free product to Supabase...')
  
  // First, let's check the table structure
  console.log('Checking products table structure...')
  const { data: existingProducts, error: checkError } = await supabase
    .from('products')
    .select('*')
    .limit(1)
  
  if (checkError) {
    console.error('Error checking table:', checkError)
    return
  }
  
  if (existingProducts && existingProducts.length > 0) {
    console.log('Available columns:', Object.keys(existingProducts[0]))
  }
  
  const freeProduct = {
    name: 'HoopMetrix Team Sticker Pack - FREE',
    description: 'Free HoopMetrix logo stickers - show your basketball love! No charge at checkout.',
    price: 0.01, // Minimum price due to database constraint, but will show as FREE
    original_price: 5.99,
    image_url: '/products/free-stickers.jpg',
    category: 'Accessories',
    stock_quantity: 1000,
    is_active: true
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([freeProduct])
      .select()

    if (error) {
      console.error('Error adding free product:', error)
      return
    }

    console.log('✅ Free product added successfully!')
    console.log('Product details:', data[0])
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

// Run the script
addFreeProduct()