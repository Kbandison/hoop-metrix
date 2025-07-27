import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear all items from user's cart
    const { error } = await supabase
      .from('user_carts')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing cart:', error)
      return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Cart cleared successfully' })
  } catch (error) {
    console.error('Clear cart API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}