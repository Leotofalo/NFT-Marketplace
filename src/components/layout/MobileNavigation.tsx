import { Link } from '@tanstack/react-router'

const navigationItems = [
  { label: 'Início', to: '/', icon: '⌂' },
  { label: 'Favoritos', to: '/favorites', icon: '♥' },
  { label: 'Carteiras', to: '/wallets', icon: '◉' },
  { label: 'Carrinho', to: '/cart', icon: '🛒' },
  { label: 'Perfil', to: '/profile', icon: '♟' },
] as const

export function MobileNavigation() {
  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-card px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navigationItems.map((item) => <Link key={item.label} to={item.to} aria-label={item.label} className="flex min-w-0 flex-col items-center gap-1 px-2 text-text-secondary transition hover:text-primary">
          <span className="text-xl leading-none" aria-hidden="true">{item.icon}</span>
          <span className="text-[9px]">{item.label}</span>
        </Link>)}
      </div>
    </nav>
  )
}
