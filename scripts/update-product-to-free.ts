import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateProductToFree() {
  console.log('Updating sticker pack to be truly free...')
  
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        price: 0.00,
        name: 'HoopMetrix Team Sticker Pack - FREE',
        description: 'Free HoopMetrix logo stickers - show your basketball love! Completely free with any order.'
      })
      .eq('name', 'HoopMetrix Team Sticker Pack - FREE')
      .select()

    if (error) {
      console.error('Error updating product:', error)
      
      if (error.code === '23514') {
        console.log('❌ Price constraint still exists!')
        console.log('Please remove the constraint first using the Supabase dashboard')
        return
      }
      
      return
    }

    if (data && data.length > 0) {
      console.log('✅ Product updated to be truly free!')
      console.log('New price:', data[0].price)
    } else {
      console.log('❌ Product not found')
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

// Run the script
updateProductToFree()