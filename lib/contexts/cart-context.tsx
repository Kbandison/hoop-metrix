'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

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
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  isOpen: boolean
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

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
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
      const existingItemIndex = state.items.findIndex(
        item => item.id === newItem.id && 
                item.selectedSize === newItem.selectedSize && 
                item.selectedColor === newItem.selectedColor
      )

      let updatedItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        // Add new item
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

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isOpen: false
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('hoopmetrix-cart')
      if (savedCart) {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartItems })
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('hoopmetrix-cart', JSON.stringify(state.items))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [state.items])

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
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
      closeCart
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
export const createCartItemKey = (item: Pick<CartItem, 'id' | 'selectedSize' | 'selectedColor'>) => {
  return `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`
}