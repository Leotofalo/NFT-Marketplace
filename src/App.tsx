import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes'
import { FavoritesProvider } from './features/favorites/FavoritesContext'
import { CartProvider } from './features/cart/CartContext'

function App() {
  return (
    <FavoritesProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </FavoritesProvider>
  )
}

export default App