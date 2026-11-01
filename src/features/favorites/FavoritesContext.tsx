import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getSessionUserId } from '../../services/session'
import { FavoritesContext } from './favoritesContextStore'

const STORAGE_KEY = 'kurio-favorite-nfts'

function ownerKey() {
  return getSessionUserId() ?? 'guest'
}

function loadFavorites(owner: string): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${owner}`)
    const legacy = owner === 'guest' ? localStorage.getItem(STORAGE_KEY) : null
    const parsed: unknown = JSON.parse(raw ?? legacy ?? '[]')
    return Array.isArray(parsed) && parsed.every((id) => typeof id === 'string') ? parsed : []
  } catch {
    return []
  }
}

interface FavoritesProviderProps {
  children: ReactNode
}

export function FavoritesProvider({
  children,
}: FavoritesProviderProps) {
  const [state, setState] = useState(() => {
    const owner = ownerKey()
    return { owner, ids: loadFavorites(owner) }
  })

  const favoriteIds = state.ids

  useEffect(() => {
    function syncOwner() {
      const owner = ownerKey()
      setState((current) => current.owner === owner ? current : { owner, ids: loadFavorites(owner) })
    }
    window.addEventListener('kurio-auth-changed', syncOwner)
    window.addEventListener('storage', syncOwner)
    return () => {
      window.removeEventListener('kurio-auth-changed', syncOwner)
      window.removeEventListener('storage', syncOwner)
    }
  }, [])

  useEffect(() => {
    if (state.owner === ownerKey()) localStorage.setItem(`${STORAGE_KEY}:${state.owner}`, JSON.stringify(state.ids))
  }, [state])

  function isFavorite(nftId: string) {
    return favoriteIds.includes(nftId)
  }

  function toggleFavorite(nftId: string) {
    setState((current) => ({
      ...current,
      ids: current.ids.includes(nftId)
        ? current.ids.filter((id) => id !== nftId)
        : [...current.ids, nftId],
    }),
    )
  }

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

