export function getSessionUserId(): string | null {
  try {
    const user = JSON.parse(localStorage.getItem('kurio-user') ?? 'null') as { id?: string } | null
    return user?.id ?? null
  } catch {
    return null
  }
}

export function hasValidSession(): boolean {
  const token = localStorage.getItem('kurio-token')
  const userId = getSessionUserId()
  const expiresAt = Number(localStorage.getItem('kurio-token-expires-at') ?? 0)
  return Boolean(token && userId && (!expiresAt || expiresAt > Date.now()))
}

export function saveSession(token: string, user: { id: string; name: string; email: string }) {
  localStorage.setItem('kurio-token', token)
  localStorage.setItem('kurio-user', JSON.stringify(user))
  localStorage.setItem('kurio-token-expires-at', String(Date.now() + 60 * 60 * 1000))
  notifySessionChanged()
}

export function notifySessionChanged() {
  window.dispatchEvent(new Event('kurio-auth-changed'))
}

export function clearSession() {
  localStorage.removeItem('kurio-token')
  localStorage.removeItem('kurio-user')
  localStorage.removeItem('kurio-token-expires-at')
  notifySessionChanged()
}

export function migrateLegacyDemoSession() {
  if (localStorage.getItem('kurio-token') === 'kurio-mock-session-token') {
    clearSession()
  }
}
