import { io } from 'socket.io-client'

export const realtimeSocket = io(window.location.origin, {
  path: import.meta.env.VITE_SOCKET_PATH || '/socket.io/',
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
})
