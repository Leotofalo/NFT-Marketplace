import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { MobileNavigation } from '../../components/layout/MobileNavigation'
import { useCart } from './useCart'
import { nftData } from '../nft/nftData'
import { api } from '../../services/api'
import { hasValidSession } from '../../services/session'

export function CartPage() {
  const navigate = useNavigate()
  const {
    items,
    itemCount,
    subtotal,
    priceOverrides,
    removeItem,
    updateQuantity,
  } = useCart()

  const [searchTerm, setSearchTerm] = useState('')
  const [coupon, setCoupon] = useState(() => sessionStorage.getItem('kurio-coupon') ?? '')
  const [couponMessage, setCouponMessage] = useState('')
  const [couponPercent, setCouponPercent] = useState(() => sessionStorage.getItem('kurio-coupon') === 'GENESIS10' ? 10 : 0)
  const [couponLoading, setCouponLoading] = useState(false)

  const cartNFTs = items.flatMap((item) => {
    const nft = nftData.find((entry) => entry.id === item.nftId)

    return nft ? [{ ...nft, price: priceOverrides[nft.id] ?? nft.price, quantity: item.quantity }] : []
  })

  const recommendations = nftData
    .filter((nft) => !items.some((item) => item.nftId === nft.id))
    .slice(0, 5)

  const networkFee = items.length > 0 ? 0.016 : 0
  const discount = Number((subtotal * couponPercent / 100).toFixed(3))
  const total = subtotal - discount + networkFee

  function formatETH(value: number) {
    return `${value.toFixed(3)} ETH`
  }

  async function handleApplyCoupon() {
    if (!coupon.trim()) {
      setCouponMessage('Digite um código promocional.')
      return
    }

    setCouponLoading(true)
    try {
      const { data } = await api.post<{ valid: boolean; discountPercent?: number; message: string }>('/coupons/validate', { code: coupon })
      if (!data.valid) { setCouponPercent(0); sessionStorage.removeItem('kurio-coupon'); setCouponMessage(data.message); return }
      sessionStorage.setItem('kurio-coupon', coupon.trim().toUpperCase())
      setCouponPercent(data.discountPercent ?? 0)
      setCouponMessage(data.message)
    } catch (error) {
      setCouponPercent(0)
      sessionStorage.removeItem('kurio-coupon')
      setCouponMessage((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Não foi possível validar o cupom.')
    } finally { setCouponLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ink pb-24 text-foreground md:pb-0">
      <Header
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav
          aria-label="Navegação estrutural"
          className="mb-8 text-xs text-text-secondary sm:text-sm"
        >
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <span>Mercado</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Carrinho</span>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)] lg:gap-16">
          <section aria-label="Itens do carrinho">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(75px,0.6fr)_minmax(90px,0.7fr)_minmax(80px,0.7fr)_24px] gap-3 border-b border-border pb-3 text-sm font-bold sm:grid">
              <span>NFTs</span>
              <span>Preço</span>
              <span>Edições</span>
              <span>Total</span>
              <span />
            </div>

            {cartNFTs.length === 0 ? (
              <div className="mt-5 rounded-xl border border-border bg-surface-card px-6 py-12 text-center">
                <span
                  aria-hidden="true"
                  className="text-5xl text-primary"
                >
                  ♧
                </span>

                <h1 className="mt-4 text-xl font-bold">
                  Seu carrinho está vazio
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-text-secondary">
                  Explore o marketplace e encontre obras digitais para
                  adicionar à sua coleção.
                </p>

                <Link
                  to="/"
                  className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-bold text-ink transition hover:bg-primary-light"
                >
                  Explorar NFTs
                </Link>
              </div>
            ) : (
              <div className="space-y-3 pt-3">
                {cartNFTs.map((nft) => {
                  const lineTotal = Number(
                    nft.price.match(/[\d.,]+/)?.[0]?.replace(',', '.') ?? 0,
                  ) * nft.quantity

                  return (
                    <article
                      key={nft.id}
                      className="rounded-xl border border-border-soft bg-surface-card p-3 sm:border-0 sm:bg-surface-card sm:p-3"
                    >
                      <div className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(75px,0.6fr)_minmax(90px,0.7fr)_minmax(80px,0.7fr)_24px] sm:gap-3">
                        <Link
                          to="/nft/$nftId"
                          params={{ nftId: nft.id }}
                          className="overflow-hidden rounded-lg sm:hidden"
                          aria-label={`Ver ${nft.name}`}
                        >
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="aspect-square w-full object-cover"
                          />
                        </Link>

                        <div className="hidden min-w-0 items-center gap-3 sm:flex">
                          <Link
                            to="/nft/$nftId"
                            params={{ nftId: nft.id }}
                            className="w-14 shrink-0 overflow-hidden rounded-lg"
                          >
                            <img
                              src={nft.image}
                              alt={nft.name}
                              className="aspect-square w-full object-cover"
                            />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              to="/nft/$nftId"
                              params={{ nftId: nft.id }}
                              className="block truncate text-sm font-bold hover:text-primary"
                            >
                              {nft.name}
                            </Link>

                            <p className="mt-1 truncate text-xs text-text-secondary">
                              ID do token: {nft.id}
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0 sm:hidden">
                          <Link
                            to="/nft/$nftId"
                            params={{ nftId: nft.id }}
                            className="block text-sm font-bold hover:text-primary"
                          >
                            {nft.name}
                          </Link>

                          <p className="mt-1 text-xs text-text-secondary">
                            {nft.price}
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={`Diminuir quantidade de ${nft.name}`}
                              disabled={nft.quantity <= 1}
                              onClick={() =>
                                updateQuantity(nft.id, nft.quantity - 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-ink disabled:opacity-40"
                            >
                              −
                            </button>

                            <span className="min-w-4 text-center text-sm">
                              {nft.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Aumentar quantidade de ${nft.name}`}
                              disabled={nft.quantity >= 10}
                              onClick={() =>
                                updateQuantity(nft.id, nft.quantity + 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-ink disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <span className="hidden text-sm sm:block">
                          {nft.price}
                        </span>

                        <div className="hidden items-center gap-2 sm:flex">
                          <button
                            type="button"
                            aria-label={`Diminuir quantidade de ${nft.name}`}
                            disabled={nft.quantity <= 1}
                            onClick={() =>
                              updateQuantity(nft.id, nft.quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-ink disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="min-w-4 text-center text-sm">
                            {nft.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Aumentar quantidade de ${nft.name}`}
                            disabled={nft.quantity >= 10}
                            onClick={() =>
                              updateQuantity(nft.id, nft.quantity + 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-ink disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right sm:text-left">
                          <p className="text-sm font-bold text-primary">
                            {formatETH(lineTotal)}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeItem(nft.id)}
                            aria-label={`Remover ${nft.name} do carrinho`}
                            className="mt-2 text-xs text-text-secondary transition hover:text-red-400 sm:hidden"
                          >
                            Remover
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(nft.id)}
                          aria-label={`Remover ${nft.name} do carrinho`}
                          className="hidden text-lg text-text-secondary transition hover:text-primary sm:block"
                        >
                          ♧
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {cartNFTs.length > 0 && (
              <p className="mt-4 text-xs text-text-secondary">
                {itemCount} {itemCount === 1 ? 'edição' : 'edições'} no
                carrinho
              </p>
            )}
          </section>

          <aside className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
            <h2 className="border-b border-border pb-4 text-lg font-bold">
              Resumo da carteira
            </h2>

            <div className="mt-5">
              <label
                htmlFor="coupon"
                className="mb-2 block text-xs font-bold"
              >
                Código promocional
              </label>

              <div className="flex">
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(event) => {
                    setCoupon(event.target.value)
                    setCouponMessage('')
                  }}
                  placeholder="Digite o código promocional..."
                  className="min-w-0 flex-1 rounded-l-md border border-border bg-ink px-3 py-3 text-xs outline-none placeholder:text-text-secondary focus:border-primary"
                />

                <button
                  type="button"
                  onClick={() => void handleApplyCoupon()}
                  disabled={couponLoading}
                  className="rounded-r-md bg-primary px-4 text-xs font-bold text-ink transition hover:bg-primary-light"
                >
                  {couponLoading ? 'Validando…' : 'Aplicar'}
                </button>
              </div>

              {couponMessage && (
                <p
                  role="status"
                  className="mt-2 text-xs text-text-secondary"
                >
                  {couponMessage}
                </p>
              )}
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-text-secondary">Subtotal</dt>
                <dd>{formatETH(subtotal)}</dd>
              </div>

              <div className="flex items-center justify-between gap-4">
                <dt className="text-text-secondary">
                  Desconto do lançamento
                </dt>
                <dd>{`(-) ${formatETH(discount)}`}</dd>
              </div>

              <div className="flex items-center justify-between gap-4">
                <dt className="text-text-secondary">
                  Taxa de rede
                  <span className="mt-1 block text-[10px] text-primary">
                    Taxa estimada
                  </span>
                </dt>
                <dd>{formatETH(networkFee)}</dd>
              </div>
            </dl>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
              <span className="font-bold">Total</span>
              <span className="text-lg font-bold text-primary">
                {formatETH(total)}
              </span>
            </div>

            <button
              type="button"
              disabled={cartNFTs.length === 0}
              onClick={() => {
                if (!hasValidSession()) {
                  sessionStorage.setItem('kurio-return-to', '/payment')
                  void navigate({ to: '/login' })
                  return
                }
                void navigate({ to: '/payment' })
              }}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-ink transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              Conectar e finalizar
            </button>

            <Link
              to="/"
              className="mt-4 block text-center text-sm text-primary transition hover:text-primary-light"
            >
              Continuar explorando
            </Link>
          </aside>
        </div>

        {recommendations.length > 0 && (
          <section className="mt-16">
            <h2 className="border-b border-border pb-3 text-lg font-bold text-primary">
              Colecionadores também viram
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {recommendations.map((nft) => (
                <Link
                  key={nft.id}
                  to="/nft/$nftId"
                  params={{ nftId: nft.id }}
                  className="group min-w-0"
                >
                  <div className="overflow-hidden rounded-xl bg-surface-card p-2">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      loading="lazy"
                      className="aspect-square w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="mt-3 truncate text-xs font-medium sm:text-sm">
                    {nft.name}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-primary">
                    {nft.price}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileNavigation />
    </div>
  )
}
