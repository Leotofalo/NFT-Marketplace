import axios from 'axios'
import { clearSession } from './session'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

api.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError<{ code?: string }>(error) && error.response?.data?.code === 'SESSION_EXPIRED') clearSession()
  return Promise.reject(error)
})
