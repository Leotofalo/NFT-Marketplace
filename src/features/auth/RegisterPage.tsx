import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { api } from '../../services/api'
import { saveSession } from '../../services/session'
import { SocialAuthButtons } from './SocialAuthButtons'

interface RegisterResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

export function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post<RegisterResponse>(
        '/auth/register',
        {
          name: name.trim(),
          email: email.trim(),
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
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err
      ) {
        const response = (
          err as {
            response?: {
              data?: { message?: string }
            }
          }
        ).response

        setError(
          response?.data?.message ??
            'Não foi possível criar sua conta.',
        )
      } else {
        setError('Não foi possível conectar ao servidor.')
      }
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

        <h1 className="mt-16 text-center text-lg font-bold sm:mt-8 sm:text-left sm:text-3xl">
          Crie sua conta
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Comece sua coleção de arte digital.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="register-name" className="mb-2 block text-sm">
              Nome completo
            </label>

            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-lg border border-border bg-ink px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="mb-2 block text-sm">
              E-mail
            </label>

            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full rounded-lg border border-border bg-ink px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="mb-2 block text-sm"
            >
              Senha
            </label>

            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full rounded-lg border border-border bg-ink px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-2 block text-sm"
            >
              Confirmar senha
            </label>

            <input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Digite a senha novamente"
              className="w-full rounded-lg border border-border bg-ink px-4 py-3 text-sm outline-none focus:border-primary"
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
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <SocialAuthButtons />

        <p className="mt-6 text-center text-sm text-text-secondary">
          Já possui uma conta?{' '}
          <Link
            to="/login"
            className="font-bold text-primary hover:underline"
          >
            Entrar
          </Link>
        </p>
      </section>
    </main>
  )
}
