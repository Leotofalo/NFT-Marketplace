import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import type { NFT } from '../../features/nft/nftData'
import { useFavorites } from '../../features/favorites/useFavorites'
import { hasValidSession } from '../../services/session'

interface NFTCardProps {
  nft: NFT
}

export function NFTCard({ nft }: NFTCardProps) {
  const [liveUpdate, setLiveUpdate] = useState<{ id: string; price: string } | null>(null)
  const price = liveUpdate?.id === nft.id ? liveUpdate.price : nft.price
  const currency = nft.network === 'Solana' ? 'SOL' : nft.network === 'Polygon' ? 'POL' : 'ETH'
  const livePrice = `${price.match(/[\d.]+/)?.[0] ?? '0'} ${currency}`
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(nft.id)

  useEffect(() => {
    function updatePrice(event: Event) {
      const detail = (event as CustomEvent<{ id?: string; price?: string }>).detail
      if (detail?.id === nft.id && detail.price) setLiveUpdate({ id: nft.id, price: detail.price })
    }
    window.addEventListener('kurio-nft-updated', updatePrice)
    return () => window.removeEventListener('kurio-nft-updated', updatePrice)
  }, [nft.id])

  function handleFavoriteClick() {
    if (!hasValidSession()) {
      sessionStorage.setItem('kurio-return-to', '/favorites')
      void navigate({ to: '/login' })
      return
    }
    toggleFavorite(nft.id)
  }

  return (
    <article className="min-w-0">
      <div className="relative">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="group block"
          aria-label={`Ver detalhes de ${nft.name}`}
        >
          <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-raised">
            <img
              src={nft.image}
              alt={nft.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {nft.featured && (
              <span className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase text-ink">
                Destaque
              </span>
            )}
          </div>

          <div className="pt-3">
            <h3 className="truncate text-xs font-medium text-foreground sm:text-sm">
              {nft.name}
            </h3>

            <p className="mt-1 text-sm font-bold text-primary">
              {livePrice}
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label={
            favorite
              ? `Remover ${nft.name} dos favoritos`
              : `Adicionar ${nft.name} aos favoritos`
          }
          aria-pressed={favorite}
          onClick={handleFavoriteClick}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-xl transition hover:bg-primary hover:text-ink ${
            favorite ? 'text-primary' : 'text-foreground'
          }`}
        >
          {favorite ? '♥' : '♡'}
        </button>
      </div>
    </article>
  )
}
