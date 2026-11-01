import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useNFT, useNFTs } from './useNFTs'
import { useFavorites } from '../favorites/useFavorites'
import { useCart } from '../cart/useCart'
import { hasValidSession } from '../../services/session'

export function NFTDetailsPage() {
  const navigate = useNavigate()
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const { data: nft, error, isLoading, isError, refetch } = useNFT(nftId)
  const { data: allNFTResponse } = useNFTs()
  const allNFTs = allNFTResponse?.items ?? []

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>(
    'details',
  )
  const [addedToCart, setAddedToCart] = useState(false)

  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  function handleQuantityChange(value: number) {
    setQuantity(Math.max(1, Math.min(10, value)))
  }

  function handleAddToCart() {
    if (!nft) return

    addItem(nft.id, quantity)
    setAddedToCart(true)

    window.setTimeout(() => {
      setAddedToCart(false)
    }, 3000)
  }

  if (isLoading) {
    return <main aria-label="Carregando NFT" className="mx-auto max-w-7xl px-4 py-10"><div className="grid gap-8 md:grid-cols-2"><div className="skeleton-shimmer aspect-square rounded-2xl" /><div className="space-y-4"><div className="skeleton-shimmer h-8 rounded" /><div className="skeleton-shimmer h-5 w-1/2 rounded" /><div className="skeleton-shimmer h-40 rounded-xl" /></div></div></main>
  }

  if (isError) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-foreground"><h1 className="text-2xl font-bold">NFT não encontrado</h1><p className="mt-3 text-sm text-text-secondary">Esse item não existe ou não está disponível.</p><Link to="/" className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-ink transition hover:bg-primary-light">Voltar ao marketplace</Link></main>
    }
    return <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-foreground"><h1 className="text-2xl font-bold">Não foi possível carregar o NFT</h1><button onClick={() => void refetch()} className="mt-5 text-primary underline">Tentar novamente</button><Link to="/" className="mt-4 text-sm text-text-secondary">Voltar ao marketplace</Link></main>
  }

  if (!nft) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-foreground">
        <h1 className="text-2xl font-bold">NFT não encontrado</h1>

        <p className="mt-3 text-sm text-text-secondary">
          Esse item não existe ou não está disponível.
        </p>

        <Link
          to="/"
          className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-ink transition hover:bg-primary-light"
        >
          Voltar ao marketplace
        </Link>
      </main>
    )
  }

  const favorite = isFavorite(nft.id)

  const relatedNFTs = allNFTs
    .filter(
      (item) =>
        item.id !== nft.id && item.category === nft.category,
    )
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-ink text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-6 pb-16 sm:px-6 sm:py-10 lg:px-8">
        <nav
          aria-label="Navegação estrutural"
          className="mb-8 flex flex-wrap items-center gap-2 text-xs text-text-secondary sm:text-sm"
        >
          <Link to="/" className="transition hover:text-primary">
            Marketplace
          </Link>

          <span aria-hidden="true">/</span>
          <span>{nft.category}</span>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">{nft.name}</span>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <section aria-label="Imagem do NFT">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
              <img
                src={nft.image}
                alt={nft.name}
                className="aspect-square w-full object-cover"
              />
            </div>

            <p className="mt-3 text-xs text-text-secondary">
              Imagem ilustrativa da obra digital.
            </p>
          </section>

          <section>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border-soft px-3 py-1 text-xs text-text-secondary">
                {nft.category}
              </span>

              {nft.featured && (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-ink">
                  Destaque
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              {nft.name}
            </h1>

            <p className="mt-3 text-sm text-text-secondary">
              Uma obra digital colecionável disponível no marketplace Kurio.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-surface-card p-5 sm:p-6">
              <p className="text-xs text-text-secondary">Preço atual</p>

              <p className="mt-2 text-3xl font-bold text-primary">
                {nft.price}
              </p>

              <p className="mt-2 text-xs text-text-secondary">
                O valor apresentado corresponde ao preço cadastrado para
                este item.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <label
                    htmlFor="nft-quantity"
                    className="block text-sm font-medium"
                  >
                    Quantidade
                  </label>

                  <div className="mt-2 flex items-center rounded-lg border border-border">
                    <button
                      type="button"
                      aria-label="Diminuir quantidade"
                      disabled={quantity <= 1}
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="h-10 w-10 text-lg transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>

                    <input
                      id="nft-quantity"
                      type="number"
                      min={1}
                      max={10}
                      value={quantity}
                      onChange={(event) => {
                        const value = Number(event.target.value)

                        if (Number.isFinite(value) && value >= 1) {
                          handleQuantityChange(value)
                        }
                      }}
                      className="h-10 w-12 appearance-none bg-transparent text-center text-sm outline-none"
                    />

                    <button
                      type="button"
                      aria-label="Aumentar quantidade"
                      disabled={quantity >= 10}
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="h-10 w-10 text-lg transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!hasValidSession()) {
                      sessionStorage.setItem('kurio-return-to', `/nft/${nft.id}`)
                      void navigate({ to: '/login' })
                    } else toggleFavorite(nft.id)
                  }}
                  aria-pressed={favorite}
                  className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm transition hover:border-primary hover:text-primary"
                >
                  <span aria-hidden="true">
                    {favorite ? '♥' : '♡'}
                  </span>

                  {favorite ? 'Favoritado' : 'Favoritar'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`mt-6 w-full rounded-lg px-5 py-3.5 text-sm font-bold transition ${
                  addedToCart
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary text-ink hover:bg-primary-light'
                }`}
              >
                {addedToCart
                  ? '✓ Adicionado ao carrinho!'
                  : 'Adicionar ao carrinho'}
              </button>

              {addedToCart ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-3 flex flex-col gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4"
                >
                  <p className="text-sm text-emerald-400">
                    ✓ {quantity}{' '}
                    {quantity === 1
                      ? 'NFT adicionado'
                      : 'NFTs adicionados'}{' '}
                    ao seu carrinho com sucesso!
                  </p>

                  <Link
                    to="/cart"
                    className="text-sm font-bold text-primary transition hover:text-primary-light"
                  >
                    Ver carrinho e finalizar compra →
                  </Link>
                </div>
              ) : (
                <p className="mt-3 text-center text-xs text-text-secondary">
                  Você pode revisar seus itens antes de finalizar a compra.
                </p>
              )}
            </div>

            <section className="mt-6 rounded-2xl border border-border bg-surface-card p-5 sm:p-6">
              <div
                role="tablist"
                aria-label="Informações do NFT"
                className="flex gap-6 border-b border-border"
              >
                <button
                  type="button"
                  role="tab"
                  id="details-tab"
                  aria-selected={activeTab === 'details'}
                  aria-controls="details-panel"
                  onClick={() => setActiveTab('details')}
                  className={`border-b-2 pb-3 text-sm font-bold transition ${
                    activeTab === 'details'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-foreground'
                  }`}
                >
                  Detalhes
                </button>

                <button
                  type="button"
                  role="tab"
                  id="reviews-tab"
                  aria-selected={activeTab === 'reviews'}
                  aria-controls="reviews-panel"
                  onClick={() => setActiveTab('reviews')}
                  className={`border-b-2 pb-3 text-sm font-bold transition ${
                    activeTab === 'reviews'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-foreground'
                  }`}
                >
                  Avaliações
                </button>
              </div>

              {activeTab === 'details' ? (
                <div
                  id="details-panel"
                  role="tabpanel"
                  aria-labelledby="details-tab"
                  className="pt-5"
                >
                  <h2 className="text-sm font-bold">Sobre esta obra</h2>

                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    {nft.name} faz parte da categoria {nft.category}.
                    Explore a obra e conheça outros itens disponíveis
                    no marketplace.
                  </p>

                  <dl className="mt-5 space-y-4 text-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                      <dt className="text-text-secondary">Nome</dt>
                      <dd className="break-words sm:text-right">
                        {nft.name}
                      </dd>
                    </div>

                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                      <dt className="text-text-secondary">Categoria</dt>
                      <dd className="sm:text-right">{nft.category}</dd>
                    </div>

                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                      <dt className="text-text-secondary">Identificador</dt>
                      <dd className="break-all sm:text-right">{nft.id}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div
                  id="reviews-panel"
                  role="tabpanel"
                  aria-labelledby="reviews-tab"
                  className="pt-5"
                >
                  <h2 className="text-sm font-bold">Avaliações</h2>

                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    Ainda não há avaliações cadastradas para esta obra.
                  </p>
                </div>
              )}
            </section>
          </section>
        </div>

        {relatedNFTs.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Continue explorando
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Mais desta categoria
                </h2>
              </div>

              <Link
                to="/"
                className="text-sm font-medium text-primary transition hover:text-primary-light"
              >
                Ver marketplace →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {relatedNFTs.map((relatedNFT) => (
                <Link
                  key={relatedNFT.id}
                  to="/nft/$nftId"
                  params={{ nftId: relatedNFT.id }}
                  className="group min-w-0"
                >
                  <div className="overflow-hidden rounded-xl bg-surface-raised">
                    <img
                      src={relatedNFT.image}
                      alt={relatedNFT.name}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="mt-3 truncate text-sm font-medium">
                    {relatedNFT.name}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-primary">
                    {relatedNFT.price}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
