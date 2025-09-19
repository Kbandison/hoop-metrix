'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  selectedSize?: string
  selectedColor?: string
  quantity: number
  inStock: boolean
  uniqueId?: string
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  isOpen: boolean
  isLoading: boolean
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean }

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  syncWithDatabase: () => Promise<void>
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return { totalItems, totalAmount }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem = { ...action.payload, quantity: action.payload.quantity || 1 }
      
      console.log('Adding item:', newItem) // Debug log
      console.log('Current items:', state.items.map(item => ({ 
        id: item.id, 
        selectedSize: item.selectedSize, 
        selectedColor: item.selectedColor 
      }))) // Debug log
      
      const existingItemIndex = state.items.findIndex(
        item => item.id === newItem.id && 
                item.selectedSize === newItem.selectedSize && 
                item.selectedColor === newItem.selectedColor
      )

      console.log('Existing item index:', existingItemIndex) // Debug log

      let updatedItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        console.log('Updating existing item quantity') // Debug log
        updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        // Add new item
        console.log('Adding new item') // Debug log
        updatedItems = [...state.items, newItem as CartItem]
      }

      const totals = calculateTotals(updatedItems)
      return {
        ...state,
        items: updatedItems,
        ...totals
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => {
        // Create a unique key for comparison
        const itemKey = `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`
        return itemKey !== action.payload
      })
      const totals = calculateTotals(updatedItems)
      return {
        ...state,
        items: updatedItems,
        ...totals
      }
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        // Remove item if quantity is 0 or less
        const updatedItems = state.items.filter(item => {
          const itemKey = `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`
          return itemKey !== action.payload.id
        })
        const totals = calculateTotals(updatedItems)
        return {
          ...state,
          items: updatedItems,
          ...totals
        }
      }

      const updatedItems = state.items.map(item => {
        const itemKey = `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`
        return itemKey === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      })
      const totals = calculateTotals(updatedItems)
      return {
        ...state,
        items: updatedItems,
        ...totals
      }
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0
      }

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      }

    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true
      }

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false
      }

    case 'LOAD_CART': {
      const totals = calculateTotals(action.payload)
      return {
        ...state,
        items: action.payload,
        ...totals
      }
    }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isOpen: false,
  isLoading: false
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { user, loading: authLoading } = useAuth()
  const [databaseAvailable, setDatabaseAvailable] = React.useState(true)

  // API helper functions
  const fetchCartFromDatabase = async (): Promise<CartItem[]> => {
    try {
      const response = await fetch('/api/cart')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.warn('Cart API response not ok:', response.status, errorData)
        
        // If it's unauthorized or table doesn't exist, return empty array
        if (response.status === 401 || response.status === 500) {
          console.warn('Database operations may not be available, falling back to localStorage only')
          setDatabaseAvailable(false)
          return []
        }
        
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Error fetching cart from database:', error)
      return []
    }
  }

  const syncCartToDatabase = async (items: CartItem[]) => {
    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localCartItems: items })
      })
      if (!response.ok) throw new Error('Failed to sync cart')
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Error syncing cart to database:', error)
      return items
    }
  }

  const addItemToDatabase = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })
      })
      if (!response.ok) {
        console.warn('Failed to add item to cart in database:', response.status)
        return false
      }
      return true
    } catch (error) {
      console.error('Error adding item to database:', error)
      return false
    }
  }

  const updateItemInDatabase = async (id: string, quantity: number, selectedSize?: string, selectedColor?: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          quantity,
          selectedSize,
          selectedColor
        })
      })
      if (!response.ok) throw new Error('Failed to update item in cart')
      return true
    } catch (error) {
      console.error('Error updating item in database:', error)
      return false
    }
  }

  const removeItemFromDatabase = async (id: string, selectedSize?: string, selectedColor?: string) => {
    try {
      const params = new URLSearchParams({ productId: id })
      if (selectedSize) params.append('selectedSize', selectedSize)
      if (selectedColor) params.append('selectedColor', selectedColor)
      
      const response = await fetch(`/api/cart?${params}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to remove item from cart')
      return true
    } catch (error) {
      console.error('Error removing item from database:', error)
      return false
    }
  }

  const clearCartInDatabase = async () => {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to clear cart')
      return true
    } catch (error) {
      console.error('Error clearing cart in database:', error)
      return false
    }
  }

  // Load cart on mount and handle auth state changes
  useEffect(() => {
    const loadCart = async () => {
      if (authLoading) return

      dispatch({ type: 'SET_LOADING', payload: true })

      try {
        if (user && databaseAvailable) {
          // User is logged in and database is available, fetch from database
          const localCart = JSON.parse(localStorage.getItem('hoopmetrix-cart') || '[]')
          
          if (localCart.length > 0) {
            // Sync local cart with database
            const mergedCart = await syncCartToDatabase(localCart)
            dispatch({ type: 'LOAD_CART', payload: mergedCart })
            // Clear localStorage since we now have it in database
            localStorage.removeItem('hoopmetrix-cart')
          } else {
            // Just fetch from database
            const databaseCart = await fetchCartFromDatabase()
            dispatch({ type: 'LOAD_CART', payload: databaseCart })
          }
        } else {
          // User is not logged in or database not available, use localStorage
          const savedCart = localStorage.getItem('hoopmetrix-cart')
          if (savedCart) {
            const cartItems = JSON.parse(savedCart)
            dispatch({ type: 'LOAD_CART', payload: cartItems })
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadCart()
  }, [user, authLoading])

  // Save cart to localStorage for non-authenticated users or when database is not available
  useEffect(() => {
    if ((!user || !databaseAvailable) && !authLoading && state.items.length > 0) {
      try {
        console.log('Cart Context - Saving cart to localStorage:', state.items.length, 'items')
        localStorage.setItem('hoopmetrix-cart', JSON.stringify(state.items))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    } else if ((!user || !databaseAvailable) && !authLoading && state.items.length === 0) {
      // Clear localStorage when cart is empty
      try {
        localStorage.removeItem('hoopmetrix-cart')
        console.log('Cart Context - Removed empty cart from localStorage')
      } catch (error) {
        console.error('Error removing cart from localStorage:', error)
      }
    }
  }, [state.items, user, authLoading, databaseAvailable])

  const addItem = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    console.log('Cart Context - Adding item:', item.name, 'quantity:', item.quantity || 1)
    
    // If user is logged in and database is available, sync with database first
    if (user && databaseAvailable) {
      console.log('Cart Context - User logged in, syncing with database')
      const success = await addItemToDatabase(item)
      if (success) {
        console.log('Cart Context - Database add successful, syncing cart')
        // If database operation succeeded, reload cart from database to ensure consistency
        await syncWithDatabase()
        console.log('Cart Context - Cart synced from database')
        return
      } else {
        console.warn('Failed to sync add operation with database, falling back to localStorage only')
        setDatabaseAvailable(false)
      }
    }

    // Fallback: optimistically update UI for localStorage-only mode
    console.log('Cart Context - Using localStorage fallback')
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = async (id: string) => {
    console.log('Cart Context - Removing item with ID:', id)
    
    // Find the item to get its details for database removal
    const itemKey = id
    const item = state.items.find(item => createCartItemKey(item) === itemKey)
    console.log('Cart Context - Found item to remove:', item?.name)
    
    // If user is logged in and database is available, sync with database first
    if (user && databaseAvailable && item) {
      console.log('Cart Context - User logged in, removing from database')
      const success = await removeItemFromDatabase(item.id, item.selectedSize, item.selectedColor)
      if (success) {
        console.log('Cart Context - Database remove successful, syncing cart')
        // If database operation succeeded, reload cart from database to ensure consistency
        await syncWithDatabase()
        console.log('Cart Context - Cart synced after removal')
        return
      } else {
        console.warn('Failed to sync remove operation with database, falling back to localStorage only')
        setDatabaseAvailable(false)
      }
    }

    // Fallback: optimistically update UI for localStorage-only mode
    console.log('Cart Context - Using localStorage fallback for removal')
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = async (id: string, quantity: number) => {
    // Find the item to get its details for database update
    const itemKey = id
    const item = state.items.find(item => createCartItemKey(item) === itemKey)
    
    // If user is logged in and database is available, sync with database first
    if (user && databaseAvailable && item) {
      const success = await updateItemInDatabase(item.id, quantity, item.selectedSize, item.selectedColor)
      if (success) {
        // If database operation succeeded, reload cart from database to ensure consistency
        await syncWithDatabase()
        return
      } else {
        console.warn('Failed to sync update operation with database, falling back to localStorage only')
        setDatabaseAvailable(false)
      }
    }

    // Fallback: optimistically update UI for localStorage-only mode
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = async () => {
    console.log('Cart Context - Clearing cart')
    
    // Always clear the UI immediately for better UX
    dispatch({ type: 'CLEAR_CART' })
    
    // If user is logged in and database is available, also clear database
    if (user && databaseAvailable) {
      console.log('Cart Context - Clearing database cart')
      const success = await clearCartInDatabase()
      if (!success) {
        console.warn('Failed to clear cart in database, but UI has been cleared')
        setDatabaseAvailable(false)
      } else {
        console.log('Cart Context - Database cart cleared successfully')
      }
    }
    
    // Also clear localStorage to prevent restoration
    try {
      localStorage.removeItem('hoopmetrix-cart')
      console.log('Cart Context - localStorage cart cleared')
    } catch (error) {
      console.error('Error clearing localStorage cart:', error)
    }
    
    console.log('Cart Context - Cart clearing completed')
  }

  const syncWithDatabase = async () => {
    if (!user) return

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const databaseCart = await fetchCartFromDatabase()
      dispatch({ type: 'LOAD_CART', payload: databaseCart })
    } catch (error) {
      console.error('Error syncing with database:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' })
  }

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' })
  }

  return (
    <CartContext.Provider value={{
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleCart,
      openCart,
      closeCart,
      syncWithDatabase
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Helper function to create unique item keys
export const createCartItemKey = (item: Pick<CartItem, 'id' | 'selectedSize' | 'selectedColor'> & { uniqueId?: string }) => {
  return item.uniqueId || `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`
}