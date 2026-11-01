import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { MobileNavigation } from '../../components/layout/MobileNavigation'
import { NFTCard } from '../../components/ui/NFTCard'
import { nftData } from '../nft/nftData'
import { useFavorites } from './useFavorites'
import { hasValidSession } from '../../services/session'

export function FavoritesPage() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!hasValidSession()) {
      sessionStorage.setItem('kurio-return-to', '/favorites')
      void navigate({ to: '/login' })
    }
  }, [navigate])
  const { favoriteIds } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')

  const favoriteNFTs = nftData.filter((nft) =>
    favoriteIds.includes(nft.id),
  )

  const filteredNFTs = favoriteNFTs.filter((nft) => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR')

    return (
      nft.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      nft.category.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
    )
  })

  return (
    <div className="min-h-screen bg-ink text-foreground">
      <Header
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-10 pb-24 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm text-text-secondary transition hover:text-primary"
          >
            ← Voltar ao mercado
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Sua coleção pessoal
              </p>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Meus favoritos
              </h1>

              <p className="mt-3 text-sm text-text-secondary">
                Os NFTs que chamaram sua atenção.
              </p>
            </div>

            <span className="rounded-full border border-border-soft px-4 py-2 text-sm text-text-secondary">
              {favoriteNFTs.length}{' '}
              {favoriteNFTs.length === 1 ? 'NFT salvo' : 'NFTs salvos'}
            </span>
          </div>
        </div>

        {favoriteNFTs.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-border bg-surface-card px-6 py-12 text-center">
            <span className="mb-5 text-5xl text-primary" aria-hidden="true">
              ♡
            </span>

            <h2 className="text-xl font-bold">
              Sua lista está esperando por você
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
              Você ainda não salvou nenhum NFT. Explore o mercado e toque
              no coração das obras que gostaria de guardar aqui.
            </p>

            <Link
              to="/"
              className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-ink transition hover:bg-primary-light"
            >
              Explorar NFTs
            </Link>
          </section>
        ) : filteredNFTs.length === 0 ? (
          <section className="rounded-2xl border border-border bg-surface-card px-6 py-12 text-center">
            <h2 className="text-lg font-bold">
              Nenhum favorito encontrado
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              Tente pesquisar por outro nome ou categoria.
            </p>

            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-5 text-sm font-bold text-primary transition hover:text-primary-light"
            >
              Limpar pesquisa
            </button>
          </section>
        ) : (
          <section
            aria-label="NFTs favoritos"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
          >
            {filteredNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </section>
        )}
      </main>

      <Footer />
      <MobileNavigation />
    </div>
  )
}
