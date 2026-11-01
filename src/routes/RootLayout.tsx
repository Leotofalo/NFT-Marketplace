import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import type { NFT } from '../features/nft/nftData'
import { realtimeSocket } from '../services/realtime'
import { getSessionUserId } from '../services/session'

type NFTUpdate = { id: string; price?: string; available?: boolean; version: number }
const seenVersions = new Map<string, number>()

export function RootLayout() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const onConnect = () => {
      realtimeSocket.emit('subscribe', {
        userId: getSessionUserId(),
        scenario: new URLSearchParams(window.location.search).get('scenario'),
      })
      void queryClient.invalidateQueries({ queryKey: ['nfts'] })
    }
    const onNFTUpdated = (event: NFTUpdate) => {
      if (!event?.id || event.version <= (seenVersions.get(event.id) ?? 0)) return
      seenVersions.set(event.id, event.version)
      if (event.price) localStorage.setItem(`kurio-nft-price:${event.id}`, event.price)
      if (event.available !== undefined) localStorage.setItem(`kurio-nft-available:${event.id}`, String(event.available))
      queryClient.setQueriesData({ queryKey: ['nfts'] }, (value: unknown) => {
        if (Array.isArray(value)) return value.map((nft) => updateNFT(nft, event))
        if (value && typeof value === 'object' && 'items' in value && Array.isArray(value.items)) {
          return { ...value, items: value.items.map((nft) => updateNFT(nft, event)) }
        }
        return updateNFT(value, event)
      })
      window.dispatchEvent(new CustomEvent('kurio-nft-updated', { detail: event }))
    }
    const onOrderUpdated = (event: { id: string; status: string; version: number }) => {
      window.dispatchEvent(new CustomEvent('kurio-order-updated', { detail: event }))
    }
    realtimeSocket.on('connect', onConnect)
    realtimeSocket.on('nft.updated', onNFTUpdated)
    realtimeSocket.on('order.updated', onOrderUpdated)
    realtimeSocket.connect()
    return () => {
      realtimeSocket.off('connect', onConnect)
      realtimeSocket.off('nft.updated', onNFTUpdated)
      realtimeSocket.off('order.updated', onOrderUpdated)
      realtimeSocket.disconnect()
    }
  }, [queryClient])

  return <Outlet />
}

function updateNFT(value: unknown, event: NFTUpdate): unknown {
  if (!value || typeof value !== 'object' || !('id' in value) || value.id !== event.id) return value
  const nft = value as NFT
  return { ...nft, price: event.price ?? nft.price, available: event.available ?? nft.available, version: event.version }
}
