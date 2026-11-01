import http from 'node:http'
import { Server } from 'socket.io'
import { NFT_PRICE_CYCLES, getOscillatingPrice } from '../src/features/nft/priceCycles.js'

const server = http.createServer()
const io = new Server(server, {
  path: '/api/socket-io/socket.io',
  transports: ['websocket'],
})
let step = 0
const versions = new Map<string, number>()
let timer: ReturnType<typeof setInterval> | undefined
function emitPrices(target: { emit: (event: string, payload: unknown) => void }) {
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

export default server
