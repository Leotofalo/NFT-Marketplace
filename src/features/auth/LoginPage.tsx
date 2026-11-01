import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { api } from '../../services/api'
import { saveSession } from '../../services/session'
import { SocialAuthButtons } from './SocialAuthButtons'

interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

export function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await api.post<LoginResponse>(
        '/auth/login',
        {
          email,
          password,
        },
      )

      saveSession(response.data.token, response.data.user)

      const returnTo = sessionStorage.getItem('kurio-return-to')
      sessionStorage.removeItem('kurio-return-to')
      if (returnTo && /^\/nft\/[a-z0-9-]+$/i.test(returnTo)) window.location.assign(returnTo)
      else if (returnTo === '/payment' || returnTo === '/favorites' || returnTo === '/profile' || returnTo === '/wallets' || returnTo === '/cart') await navigate({ to: returnTo })
      else await navigate({ to: '/' })
    } catch (err: unknown) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined

      setError(
        apiMessage ??
          'Não foi possível entrar. Verifique sua conexão e tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-12 text-foreground">
      <section className="w-full max-w-md rounded-2xl border-0 bg-transparent p-0 sm:border sm:border-border sm:bg-surface-card sm:p-8">
        <Link to="/" className="mt-10 block text-center text-3xl font-bold tracking-widest text-foreground sm:mt-0 sm:text-left sm:text-sm sm:text-primary">
          <span className="sm:hidden">KURIO</span><span className="hidden sm:inline">← Kurio</span>
        </Link>

        <h1 className="mt-16 text-center text-xl font-bold sm:mt-8 sm:text-left sm:text-3xl">
          Bem-vindo de volta
        </h1>

        <p className="mt-2 hidden text-sm text-text-secondary sm:block">
          Entre na sua conta para continuar sua coleção.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-border bg-ink px-4 py-3 text-sm outline-none placeholder:text-text-secondary focus:border-primary sm:py-3"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
              Senha
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-border bg-ink px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Digite sua senha"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-5 py-3 font-bold text-ink transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <SocialAuthButtons />

        <p className="mt-6 text-center text-sm text-text-secondary">
          Ainda não tem conta?{' '}
          <Link
            to="/register"
            className="font-bold text-primary hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
        <Link
          to="/"
          className="mt-6 block text-center text-sm text-text-secondary hover:text-primary"
        >
          Voltar ao marketplace
        </Link>
      </section>
    </main>
  )
}
