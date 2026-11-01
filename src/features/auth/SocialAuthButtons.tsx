import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '../../services/api'
import { saveSession } from '../../services/session'

type Provider = 'google' | 'facebook'
type SocialResponse = { token: string; user: { id: string; name: string; email: string } }

function GoogleMark() {
  return <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285f4]">G</span>
}

function FacebookMark() {
  return <span aria-hidden="true" className="inline-flex h-5 w-5 items-end justify-center rounded-full bg-[#1877f2] text-sm font-bold leading-[18px] text-white">f</span>
}

export function SocialAuthButtons() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<Provider | null>(null)
  const [error, setError] = useState('')

  async function authenticate(provider: Provider) {
    setLoading(provider)
    setError('')
    try {
      const { data } = await api.post<SocialResponse>('/auth/social', { provider })
      saveSession(data.token, data.user)
      const returnTo = sessionStorage.getItem('kurio-return-to')
      sessionStorage.removeItem('kurio-return-to')
      if (returnTo && /^\/nft\/[a-z0-9-]+$/i.test(returnTo)) window.location.assign(returnTo)
      else if (returnTo === '/payment' || returnTo === '/favorites' || returnTo === '/profile' || returnTo === '/wallets' || returnTo === '/cart') await navigate({ to: returnTo })
      else await navigate({ to: '/' })
    } catch {
      setError('Não foi possível simular a conexão. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return <div className="mt-7">
    <div className="flex items-center gap-3 text-xs text-text-secondary"><span className="h-px flex-1 bg-border" />Ou continue com<span className="h-px flex-1 bg-border" /></div>
    <div className="mt-3 grid gap-3">
      <button type="button" disabled={Boolean(loading)} onClick={() => void authenticate('google')} className="flex min-h-11 items-center justify-center gap-3 rounded-lg border border-border bg-ink px-4 text-sm font-medium text-text-secondary transition hover:border-primary disabled:opacity-60"><GoogleMark />{loading === 'google' ? 'Conectando…' : 'Continuar com Google'}</button>
      <button type="button" disabled={Boolean(loading)} onClick={() => void authenticate('facebook')} className="flex min-h-11 items-center justify-center gap-3 rounded-lg border border-border bg-ink px-4 text-sm font-medium text-text-secondary transition hover:border-primary disabled:opacity-60"><FacebookMark />{loading === 'facebook' ? 'Conectando…' : 'Continuar com Facebook'}</button>
    </div>
    {error && <p role="alert" className="mt-3 text-center text-sm text-red-400">{error}</p>}
    <p className="mt-3 text-center text-[11px] text-text-secondary">Demonstração: sem conexão às contas Google ou Facebook.</p>
  </div>
}
