import { createContext } from 'react'

interface FavoritesContextValue {
  favoriteIds: string[]
  isFavorite: (nftId: string) => boolean
  toggleFavorite: (nftId: string) => void
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)
