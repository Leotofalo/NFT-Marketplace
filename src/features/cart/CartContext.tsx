import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { nftData } from '../nft/nftData'
import { getSessionUserId } from '../../services/session'
import { CartContext } from './cartContextStore'

export interface CartItem {
  nftId: string
  quantity: number
}

const STORAGE_KEY = 'kurio-cart'

function ownerKey() { return getSessionUserId() ?? 'guest' }
function storageKey(owner: string) { return `${STORAGE_KEY}:${owner}` }

function getPriceInEth(price: string): number {
  const match = price.match(/[\d.,]+/)

  if (!match) return 0

  return Number(match[0].replace(',', '.'))
}

function loadCart(owner = 'guest'): CartItem[] {
  try {
    const savedCart = localStorage.getItem(storageKey(owner)) ?? (owner === 'guest' ? localStorage.getItem(STORAGE_KEY) : null)

    if (!savedCart) return []

    const parsed: unknown = JSON.parse(savedCart)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        'nftId' in item &&
        typeof item.nftId === 'string' &&
        'quantity' in item &&
        typeof item.quantity === 'number' &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        nftData.some((nft) => nft.id === item.nftId),
    )
  } catch {
    return []
  }
}

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [priceOverrides, setPriceOverrides] = useState<Record<string, string>>({})
  const [state, setState] = useState(() => {
    const owner = ownerKey()
    return { owner, items: loadCart(owner) }
  })
  const items = state.items

  useEffect(() => {
    if (state.owner === ownerKey()) localStorage.setItem(storageKey(state.owner), JSON.stringify(state.items))
  }, [state])

  useEffect(() => {
    function syncOwner() {
      const owner = ownerKey()
      setState((current) => {
        if (current.owner === owner) return current
        const next = loadCart(owner)
        if (current.owner === 'guest' && owner !== 'guest') {
          for (const guestItem of current.items) {
            const existing = next.find((item) => item.nftId === guestItem.nftId)
            if (existing) existing.quantity = Math.min(10, existing.quantity + guestItem.quantity)
            else next.push(guestItem)
          }
        }
        return { owner, items: next }
      })
    }
    window.addEventListener('kurio-auth-changed', syncOwner)
    window.addEventListener('storage', syncOwner)
    return () => {
      window.removeEventListener('kurio-auth-changed', syncOwner)
      window.removeEventListener('storage', syncOwner)
    }
  }, [])

  useEffect(() => {
    function onNFTUpdated(event: Event) {
      const detail = (event as CustomEvent<{ id?: string; price?: string }>).detail
      if (detail?.id && detail.price) setPriceOverrides((current) => ({ ...current, [detail.id!]: detail.price! }))
    }
    window.addEventListener('kurio-nft-updated', onNFTUpdated)
    return () => window.removeEventListener('kurio-nft-updated', onNFTUpdated)
  }, [])

  function addItem(nftId: string, quantity = 1) {
    const nftExists = nftData.some((nft) => nft.id === nftId)

    if (!nftExists || !Number.isInteger(quantity) || quantity < 1) {
      return
    }

    setState((current) => {
      const currentItems = current.items
      const existingItem = currentItems.find(
        (item) => item.nftId === nftId,
      )

      if (existingItem) {
        return { ...current, items: currentItems.map((item) =>
          item.nftId === nftId
            ? {
                ...item,
                quantity: Math.min(10, item.quantity + quantity),
              }
            : item,
        ) }
      }

      return { ...current, items: [...currentItems, { nftId, quantity: Math.min(10, quantity) }] }
    })
  }

  function removeItem(nftId: string) {
    setState((current) => ({ ...current, items: current.items.filter((item) => item.nftId !== nftId) }),
    )
  }

  function updateQuantity(nftId: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      removeItem(nftId)
      return
    }

    setState((current) => ({ ...current, items: current.items.map((item) =>
        item.nftId === nftId
          ? { ...item, quantity: Math.min(10, quantity) }
          : item,
      ) }),
    )
  }

  function clearCart() {
    setState((current) => ({ ...current, items: [] }))
  }

  const itemCount = items.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  const subtotal = items.reduce((total, item) => {
    const nft = nftData.find((entry) => entry.id === item.nftId)

    return nft
      ? total + getPriceInEth(priceOverrides[nft.id] ?? nft.price) * item.quantity
      : total
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        priceOverrides,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

