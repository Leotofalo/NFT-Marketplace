import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import { migrateLegacyDemoSession } from './services/session'
import featuredNFTImage from './assets/images/emerald-ape.png'

migrateLegacyDemoSession()

const featuredImagePreload = document.createElement('link')
featuredImagePreload.rel = 'preload'
featuredImagePreload.as = 'image'
featuredImagePreload.href = featuredNFTImage
featuredImagePreload.setAttribute('fetchpriority', 'high')
document.head.append(featuredImagePreload)

async function enableMocking() {
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')

    await worker.start()
  }
}

async function bootstrap() {
  await enableMocking()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
}

bootstrap()
