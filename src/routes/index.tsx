import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router"
import { HomePage } from "./HomePage"
import { RootLayout } from "./RootLayout"
import { NFTDetailsPage } from "../features/nft/NFTDetailsPage"
import { FavoritesPage } from "../features/favorites/FavoritesPage"
import { CartPage } from "../features/cart/CartPage"
import { LoginPage } from "../features/auth/LoginPage"
import { RegisterPage } from "../features/auth/RegisterPage"
import { OrderConfirmationPage, PaymentPage, ProfilePage, WalletsPage } from "../features/profile/AccountPages"

const rootRoute = createRootRoute({ component: RootLayout })
type HomeSearch = {
  q?: string
  category?: string
  tab?: 'all' | 'new' | 'trending'
  page?: number
  min?: number
  max?: number
  sort?: 'recent' | 'price-low' | 'price-high'
  networks?: string[]
}
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    const result: HomeSearch = {}
    if (typeof search.q === 'string') result.q = search.q
    if (typeof search.category === 'string') result.category = search.category
    if (search.tab === 'new' || search.tab === 'trending' || search.tab === 'all') result.tab = search.tab
    if (Number.isInteger(Number(search.page)) && Number(search.page) > 0) result.page = Number(search.page)
    if (Number.isFinite(Number(search.min))) result.min = Math.max(0, Number(search.min))
    if (Number.isFinite(Number(search.max))) result.max = Math.max(0, Number(search.max))
    if (search.sort === 'price-low' || search.sort === 'price-high' || search.sort === 'recent') result.sort = search.sort
    let rawNetworks: unknown[] = Array.isArray(search.networks) ? search.networks : typeof search.networks === 'string' ? [search.networks] : []
    if (typeof search.networks === 'string' && search.networks.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(search.networks)
        if (Array.isArray(parsed)) rawNetworks = parsed
      } catch {
        rawNetworks = []
      }
    }
    const networks = rawNetworks.filter((value): value is string => typeof value === 'string' && ['Ethereum', 'Polygon', 'Solana'].includes(value))
    if (networks.length) result.networks = networks
    return result
  },
  component: HomePage,
})
const nftDetailsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/nft/$nftId", component: NFTDetailsPage })
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cart", component: CartPage })
const favoritesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/favorites", component: FavoritesPage })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage })
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: "/register", component: RegisterPage })
const paymentRoute = createRoute({ getParentRoute: () => rootRoute, path: "/payment", component: PaymentPage })
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: "/orders/$orderId", component: OrderConfirmationPage })
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: "/profile", component: ProfilePage })
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/wallets", component: WalletsPage })
const routeTree = rootRoute.addChildren([indexRoute, nftDetailsRoute, favoritesRoute, cartRoute, loginRoute, registerRoute, paymentRoute, orderRoute, profileRoute, walletsRoute])
export const router = createRouter({ routeTree })
declare module "@tanstack/react-router" { interface Register { router: typeof router } }
