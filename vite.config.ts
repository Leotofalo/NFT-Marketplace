import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Server as SocketIOServer } from 'socket.io'
import { NFT_PRICE_CYCLES, getOscillatingPrice } from './src/features/nft/priceCycles.js'

type HttpServer = import('node:http').Server | import('node:https').Server | import('node:http2').Http2SecureServer

function attachRealtimeMock(httpServer: HttpServer | null | undefined) {
  if (!httpServer) return
  const io = new SocketIOServer(httpServer, { path: '/socket.io/' })
  let step = 0
  const versions = new Map<string, number>()
  let timer: ReturnType<typeof setInterval> | undefined
  const emitPrices = (target: { emit: (event: string, payload: unknown) => void }) => {
    for (const nftId of Object.keys(NFT_PRICE_CYCLES)) {
      const version = (versions.get(nftId) ?? 0) + 1
      versions.set(nftId, version)
      target.emit('nft.updated', { id: nftId, price: getOscillatingPrice(nftId, step), available: true, version })
    }
  }
  io.on('connection', (socket) => {
    socket.on('subscribe', () => {
      emitPrices(socket)
      if (!timer) timer = setInterval(() => { step += 1; emitPrices(io) }, 3000)
    })
    socket.on('disconnect', () => {
      if (io.engine.clientsCount === 0 && timer) { clearInterval(timer); timer = undefined }
    })
  })
}

const realtimeMock = {
  name: 'kurio-realtime-mock',
  configureServer(server: import('vite').ViteDevServer) {
    attachRealtimeMock(server.httpServer)
  },
  configurePreviewServer(server: import('vite').PreviewServer) {
    attachRealtimeMock(server.httpServer)
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), realtimeMock],
})
