import { createContext } from 'react'
import type { CartItem } from './CartContext'

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  priceOverrides: Record<string, string>
  addItem: (nftId: string, quantity?: number) => void
  removeItem: (nftId: string) => void
  updateQuantity: (nftId: string, quantity: number) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)
