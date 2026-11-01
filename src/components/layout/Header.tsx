import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useCart } from '../../features/cart/useCart'
import { hasValidSession } from '../../services/session'

interface HeaderProps {
  searchValue: string
  onSearchChange: (value: string) => void
}

export function Header({
  searchValue,
  onSearchChange,
}: HeaderProps) {
  const { itemCount } = useCart()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  function handleSearchToggle() {
    if (isSearchOpen) {
      onSearchChange('')
    }

    setIsSearchOpen(!isSearchOpen)
  }

  return (
    <header className="border-b border-border bg-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="hidden shrink-0 text-lg font-bold tracking-widest text-foreground md:block"
        >
          KURIO
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-7 text-sm md:flex"
        >
          <Link
            to="/"
            className="border-b-2 border-primary pb-2 text-primary"
          >
            Início
          </Link>

          <a
            href="/#marketplace"
            className="text-text-secondary transition hover:text-primary"
          >
            Mercado
          </a>

          <a
            href="/#creators"
            className="text-text-secondary transition hover:text-primary"
          >
            Criadores
          </a>

          <a
            href="/#journal"
            className="text-text-secondary transition hover:text-primary"
          >
            Aprenda
          </a>
        </nav>

        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-initial">
          <div className="min-w-0 flex-1 md:hidden">
            <label htmlFor="nft-search-mobile" className="sr-only">Pesquisar NFTs por nome ou categoria</label>
            <input id="nft-search-mobile" type="search" value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder="Explorar coleções" className="w-full rounded-lg border border-transparent bg-surface-card px-3 py-2.5 text-xs outline-none placeholder:text-text-secondary focus:border-primary" />
          </div>
          {isSearchOpen && (
            <div className="hidden w-32 sm:w-48 lg:w-64 md:block">
              <label htmlFor="nft-search" className="sr-only">
                Pesquisar NFTs por nome ou categoria
              </label>

              <input
                id="nft-search"
                type="search"
                value={searchValue}
                onChange={(event) =>
                  onSearchChange(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    onSearchChange('')
                    setIsSearchOpen(false)
                  }

                  if (event.key === 'Enter') {
                    document
                      .getElementById('marketplace')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                placeholder="Buscar NFTs..."
                autoFocus
                className="w-full rounded-md border border-border-soft bg-surface-card px-3 py-2 text-xs text-foreground outline-none placeholder:text-text-secondary focus:border-primary"
              />
            </div>
          )}

          <button
            type="button"
            aria-label={
              isSearchOpen ? 'Fechar pesquisa' : 'Pesquisar NFTs'
            }
            aria-expanded={isSearchOpen}
            onClick={handleSearchToggle}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-surface-raised md:flex"
          >
            {isSearchOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4 4" />
              </svg>
            )}
          </button>

          <Link
            to="/cart"
            aria-label="Abrir carrinho"
            className="relative hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface-raised md:flex"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 1.9-1.5L20 8H6" />
              <circle cx="10" cy="19" r="1" />
              <circle cx="17" cy="19" r="1" />
            </svg>

            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-ink">
              {itemCount}
            </span>
          </Link>

          <Link
            to={hasValidSession() ? '/profile' : '/login'}
            className="hidden shrink-0 rounded-md bg-primary px-2 py-2 text-[10px] font-bold text-ink transition hover:bg-primary-light sm:px-4 sm:text-xs md:inline-flex"
          >
            {hasValidSession() ? 'Minha conta' : 'Entrar'}
          </Link>

          <button
            type="button"
            aria-label="Abrir filtros"
            onClick={() => {
              document
                .getElementById('marketplace')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-ink md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 17h16" />
              <circle cx="9" cy="7" r="2" fill="currentColor" />
              <circle cx="15" cy="17" r="2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
