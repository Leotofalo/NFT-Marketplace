import { http, HttpResponse, passthrough } from 'msw'
import { nftData, type NFT } from '../../features/nft/nftData'

function getNFT(nftId: string): NFT | undefined {
  const nft = nftData.find((item) => item.id === nftId)
  let price = nft?.price
  let available: boolean | undefined
  try {
    price = localStorage.getItem(`kurio-nft-price:${nftId}`) ?? price
    const storedAvailability = localStorage.getItem(`kurio-nft-available:${nftId}`)
    if (storedAvailability !== null) available = storedAvailability === 'true'
  } catch {
    if (!nft) return undefined
    price = nft.price
  }
  return nft ? { ...nft, price: price ?? nft.price, available } : undefined
}

interface RegisteredUser {
  id: string
  name: string
  email: string
  passwordDigest: string
}

interface CartValidationItem {
  nftId: string
  quantity: number
}

const REGISTERED_USERS_KEY = 'kurio-mock-registered-users'
const PROFILE_PREFIX = 'kurio-profile:'
const WALLETS_PREFIX = 'kurio-wallets:'
const ORDERS_KEY = 'kurio-orders'

function currentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('kurio-user') ?? 'null') as { id?: string } | null
    return user?.id
  } catch {
    return undefined
  }
}

function requireUser() {
  const userId = currentUserId()
  const token = localStorage.getItem('kurio-token')
  const expiresAt = Number(localStorage.getItem('kurio-token-expires-at') ?? 0)
  if (!token || !userId) return { error: HttpResponse.json({ message: 'Faça login para continuar.' }, { status: 401 }) }
  if (expiresAt && expiresAt <= Date.now()) return { error: HttpResponse.json({ code: 'SESSION_EXPIRED', message: 'Sua sessão expirou. Entre novamente para continuar.' }, { status: 401 }) }
  return { userId }
}

function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') as T ?? fallback } catch { return fallback }
}

type StoredWallet = { id: string; name: string; network: string; address: string; type?: string; primary?: boolean }
function readWallets(userId: string): StoredWallet[] {
  const value: unknown = readJson(`${WALLETS_PREFIX}${userId}`, [])
  if (!Array.isArray(value)) return []
  return value.filter((wallet): wallet is StoredWallet =>
    typeof wallet === 'object' && wallet !== null &&
    'id' in wallet && typeof wallet.id === 'string' &&
    'name' in wallet && typeof wallet.name === 'string' &&
    'network' in wallet && typeof wallet.network === 'string' &&
    'address' in wallet && typeof wallet.address === 'string',
  )
}

function milliETH(price: string) {
  return Math.round(Number(price.match(/[\d.]+/)?.[0] ?? 0) * 1000)
}

function loadRegisteredUsers(): RegisteredUser[] {
  try {
    const storedUsers = localStorage.getItem(REGISTERED_USERS_KEY) ?? sessionStorage.getItem(REGISTERED_USERS_KEY)
    const parsed: unknown = storedUsers ? JSON.parse(storedUsers) : []

    if (!Array.isArray(parsed)) return []

    const users = parsed.filter(
      (user): user is RegisteredUser =>
        typeof user === 'object' &&
        user !== null &&
        'id' in user && typeof user.id === 'string' &&
        'name' in user && typeof user.name === 'string' &&
        'email' in user && typeof user.email === 'string' &&
        'passwordDigest' in user && typeof user.passwordDigest === 'string',
    )
    if (users.length && !localStorage.getItem(REGISTERED_USERS_KEY)) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
    }
    return users
  } catch {
    return []
  }
}

function saveRegisteredUsers(users: RegisteredUser[]) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
}

async function digestPassword(password: string): Promise<string> {
  const encodedPassword = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', encodedPassword)

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

const demoUser = {
  id: 'collector-001',
  name: 'Colecionador Kurio',
  email: 'demo@kurio.com',
}

const demoPassword = 'kurio123'

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      message: 'API simulada funcionando',
    })
  }),

  http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/nfts/:nftId', ({ params }) => {
    const nft = getNFT(String(params.nftId))

    if (!nft) {
      return HttpResponse.json(
        { message: 'NFT não encontrado.' },
        { status: 404 },
      )
    }

    return HttpResponse.json(nft)
  }),

  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') ?? '').trim().toLocaleLowerCase('pt-BR')
    const category = url.searchParams.get('category') ?? ''
    const min = Number(url.searchParams.get('min') ?? 0)
    const max = Number(url.searchParams.get('max') ?? Number.MAX_SAFE_INTEGER)
    const sort = url.searchParams.get('sort') ?? 'recent'
    const networks = (url.searchParams.get('networks') ?? '').split(',').filter(Boolean)
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const pageSize = Math.min(24, Math.max(1, Number(url.searchParams.get('pageSize') ?? 24)))
    let results = nftData.map((nft) => getNFT(nft.id)!).filter((nft) => {
      const price = Number(nft.price.match(/[\d.]+/)?.[0] ?? 0)
      return (!q || `${nft.name} ${nft.category}`.toLocaleLowerCase('pt-BR').includes(q)) && (!category || category === 'Todas' || nft.category === category) && (!networks.length || networks.includes(nft.network)) && price >= min && price <= max
    })
    if (sort === 'price-low') results = [...results].sort((a, b) => Number(a.price.match(/[\d.]+/)?.[0]) - Number(b.price.match(/[\d.]+/)?.[0]))
    if (sort === 'price-high') results = [...results].sort((a, b) => Number(b.price.match(/[\d.]+/)?.[0]) - Number(a.price.match(/[\d.]+/)?.[0]))
    const effectivePage = Math.min(page, Math.max(1, Math.ceil(results.length / pageSize)))
    return HttpResponse.json({ items: results.slice((effectivePage - 1) * pageSize, effectivePage * pageSize), total: results.length, page: effectivePage, pageSize })
  }),

  http.get('/api/profile', () => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const profile = readJson<Record<string, unknown>>(`${PROFILE_PREFIX}${auth.userId}`, {})
    const user = readJson<{ name?: string; email?: string }>('kurio-user', {})
    return HttpResponse.json({ displayName: user.name ?? '', username: '', email: user.email ?? '', ens: '', ...profile })
  }),

  http.put('/api/profile', async ({ request }) => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const body = await request.json() as Record<string, unknown>
    const profile = {
      displayName: typeof body.displayName === 'string' ? body.displayName.trim() : '',
      username: typeof body.username === 'string' ? body.username.trim() : '',
      email: typeof body.email === 'string' ? body.email.trim() : '',
      ens: typeof body.ens === 'string' ? body.ens.trim() : '',
      avatar: typeof body.avatar === 'string' ? body.avatar : undefined,
    }
    localStorage.setItem(`${PROFILE_PREFIX}${auth.userId}`, JSON.stringify(profile))
    return HttpResponse.json(profile)
  }),

  http.get('/api/wallets', () => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const wallets = readWallets(auth.userId)
    const storedOrders: unknown = readJson(ORDERS_KEY, [])
    const orders = Array.isArray(storedOrders) ? storedOrders as Array<{
      userId?: string; status?: string; walletId?: string; wallet?: string; network?: string
      items?: Array<{ id: string; name: string; image: string; price: string; quantity: number }>
    }> : []
    const walletsWithNFTs = wallets.map((wallet) => {
      const ownedNFTs = new Map<string, { id: string; name: string; image: string; price: string; quantity: number }>()
      for (const order of orders) {
        const belongsToWallet = order.walletId
          ? order.walletId === wallet.id
          : order.wallet === wallet.name && order.network === wallet.network
        if (order.userId !== auth.userId || order.status !== 'confirmed' || !belongsToWallet || !Array.isArray(order.items)) continue
        for (const item of order.items) {
          const existing = ownedNFTs.get(item.id)
          ownedNFTs.set(item.id, { ...item, quantity: (existing?.quantity ?? 0) + item.quantity })
        }
      }
      return { ...wallet, nfts: [...ownedNFTs.values()] }
    })
    localStorage.setItem(`${WALLETS_PREFIX}${auth.userId}`, JSON.stringify(wallets))
    return HttpResponse.json(walletsWithNFTs)
  }),

  http.post('/api/wallets', async ({ request }) => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const body = await request.json() as { name?: string; network?: string; address?: string; type?: string; primary?: boolean }
    if (!body.name?.trim() || !body.network || !body.address?.trim()) return HttpResponse.json({ message: 'Preencha nome, rede e endereço.' }, { status: 400 })
    const wallets = readWallets(auth.userId)
    if (wallets.some((wallet) => wallet.address === body.address)) return HttpResponse.json({ message: 'Esta carteira já está cadastrada.' }, { status: 409 })
    const wallet: StoredWallet = {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      network: body.network,
      address: body.address.trim(),
      type: body.type,
      primary: wallets.length === 0,
    }
    wallets.push(wallet)
    localStorage.setItem(`${WALLETS_PREFIX}${auth.userId}`, JSON.stringify(wallets))
    return HttpResponse.json(wallet, { status: 201 })
  }),

  http.put('/api/wallets/:walletId', async ({ request, params }) => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const body = await request.json() as { name?: string; network?: string; address?: string; type?: string }
    if (!body.name?.trim() || !body.network || !body.address?.trim()) return HttpResponse.json({ message: 'Preencha nome, rede e endereço.' }, { status: 400 })
    const wallets = readWallets(auth.userId)
    const index = wallets.findIndex((wallet) => wallet.id === params.walletId)
    if (index < 0) return HttpResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 })
    wallets[index] = { ...wallets[index], ...body }
    localStorage.setItem(`${WALLETS_PREFIX}${auth.userId}`, JSON.stringify(wallets))
    return HttpResponse.json(wallets[index])
  }),

  http.delete('/api/wallets/:walletId', ({ params }) => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const wallets = readWallets(auth.userId)
    localStorage.setItem(`${WALLETS_PREFIX}${auth.userId}`, JSON.stringify(wallets.filter((wallet) => wallet.id !== params.walletId)))
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/coupons/validate', async ({ request }) => {
    const { code } = await request.json() as { code?: string }
    const normalized = code?.trim().toUpperCase()
    if (normalized === 'GENESIS10') return HttpResponse.json({ valid: true, discountPercent: 10, message: 'Cupom aplicado: 10% de desconto.' })
    if (normalized === 'EXPIRED') return HttpResponse.json({ valid: false, message: 'Este cupom expirou.' }, { status: 422 })
    return HttpResponse.json({ valid: false, message: 'Cupom inválido.' }, { status: 422 })
  }),

  http.post('/api/orders', async ({ request }) => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (!idempotencyKey) return HttpResponse.json({ message: 'Chave de idempotência obrigatória.' }, { status: 400 })
    const body = await request.json() as { items?: CartValidationItem[]; expectedPrices?: Record<string, string>; walletId?: string; wallet?: string; network?: string; coupon?: string; scenario?: string; collector?: { displayName: string; username: string; email: string } }
    if (!Array.isArray(body.items) || body.items.length === 0) return HttpResponse.json({ message: 'O carrinho está vazio.' }, { status: 400 })
    if (body.coupon && body.coupon.toUpperCase() !== 'GENESIS10') return HttpResponse.json({ message: 'O cupom não é válido para este pedido.' }, { status: 422 })
    const existing = readJson<Array<Record<string, unknown>>>(ORDERS_KEY, []).find((item) => item.key === idempotencyKey && item.userId === auth.userId)
    const fingerprint = JSON.stringify({ items: body.items, walletId: body.walletId, wallet: body.wallet, network: body.network, coupon: body.coupon, collector: body.collector })
    if (existing) return existing.fingerprint === fingerprint ? HttpResponse.json(existing) : HttpResponse.json({ message: 'A chave de pedido já foi usada com outros dados.' }, { status: 409 })
    if (body.scenario === 'declined') return HttpResponse.json({ message: 'Pagamento recusado pela simulação. Seus itens continuam no carrinho.' }, { status: 402 })
    const resolved = body.items.map((item) => {
      const nft = getNFT(item.nftId)
      return nft ? { id: nft.id, name: nft.name, image: nft.image, price: nft.price, quantity: item.quantity } : null
    })
    if (resolved.some((item) => !item || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10)) return HttpResponse.json({ message: 'Um item está indisponível ou tem quantidade inválida.' }, { status: 409 })
    const changedPrices = resolved.filter((item) => item && body.expectedPrices?.[item.id] && body.expectedPrices[item.id] !== item.price)
    if (changedPrices.length) return HttpResponse.json({ code: 'PRICE_CHANGED', message: 'O preço mudou durante a revisão. Confira a nova cotação e confirme novamente.', items: changedPrices.map((item) => ({ nftId: item!.id, price: item!.price })) }, { status: 409 })
    const subtotal = resolved.reduce((sum, item) => sum + milliETH(item!.price) * item!.quantity, 0)
    const fee = 0.016
    const discount = body.coupon?.toUpperCase() === 'GENESIS10' ? Math.round(subtotal / 10) : 0
    const order = { id: crypto.randomUUID(), key: idempotencyKey, fingerprint, userId: auth.userId, status: 'confirmed', transactionId: `0x${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}…${crypto.randomUUID().slice(0, 4)}`, createdAt: new Date().toISOString(), collector: body.collector, walletId: body.walletId ?? '', wallet: body.wallet ?? '', network: body.network ?? 'Ethereum', items: resolved, subtotal: (subtotal / 1000).toFixed(3), discount: (discount / 1000).toFixed(3), fee: fee.toFixed(3), total: ((subtotal - discount + Math.round(fee * 1000)) / 1000).toFixed(3) }
    const orders = readJson<Array<Record<string, unknown>>>(ORDERS_KEY, [])
    orders.push(order)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
    if (body.scenario === 'timeout-after-create') return HttpResponse.json({ message: 'Tempo limite após criar o pedido. Tente recuperar a mesma operação.' }, { status: 504 })
    return HttpResponse.json(order, { status: 201 })
  }),

  http.get('/api/orders/:orderId', ({ params }) => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const order = readJson<Array<Record<string, unknown>>>(ORDERS_KEY, []).find((item) => item.id === params.orderId && item.userId === auth.userId)
    return order ? HttpResponse.json(order) : HttpResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 })
  }),

  http.post('/api/cart/validate', async ({ request }) => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const body = (await request.json()) as {
      items?: CartValidationItem[]
      coupon?: string
    }

    if (!Array.isArray(body.items)) {
      return HttpResponse.json(
        { message: 'A lista de itens é inválida.' },
        { status: 400 },
      )
    }
    if (body.coupon && body.coupon.toUpperCase() !== 'GENESIS10') return HttpResponse.json({ message: 'O cupom não é válido para este pedido.' }, { status: 422 })

    const items = body.items.map((item) => {
      const nft = getNFT(item.nftId)

      if (!nft || nft.available === false) {
        return {
          nftId: item.nftId,
          available: false,
          quantity: item.quantity,
          message: 'NFT não encontrado ou indisponível.',
        }
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 10
      ) {
        return {
          nftId: item.nftId,
          available: true,
          price: nft.price,
          quantity: item.quantity,
          message: 'A quantidade deve estar entre 1 e 10.',
        }
      }

      return {
        nftId: item.nftId,
        available: true,
        price: nft.price,
        quantity: item.quantity,
      }
    })

    const valid = items.every((item) => item.available && !item.message)
    const subtotal = items.reduce((sum, item) => sum + milliETH(item.price ?? '0 ETH') * (Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0), 0)
    const discount = body.coupon?.toUpperCase() === 'GENESIS10' ? Math.round(subtotal / 10) : 0
    const fee = items.length ? 16 : 0
    return HttpResponse.json({
      valid,
      items,
      quote: {
        subtotal: (subtotal / 1000).toFixed(3),
        discount: (discount / 1000).toFixed(3),
        fee: (fee / 1000).toFixed(3),
        total: ((subtotal - discount + fee) / 1000).toFixed(3),
      },
    })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string
      email?: string
      password?: string
    }

    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!name || !email || !password) {
      return HttpResponse.json(
        { message: 'Preencha todos os campos.' },
        { status: 400 },
      )
    }

    if (!email.includes('@')) {
      return HttpResponse.json(
        { message: 'Informe um e-mail válido.' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return HttpResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 },
      )
    }

    if (email === demoUser.email) return HttpResponse.json({ message: 'Este e-mail já está cadastrado.' }, { status: 409 })

    const registeredUsers = loadRegisteredUsers()
    const existingUser = registeredUsers.find(
      (user) => user.email === email,
    )

    if (existingUser) {
      return HttpResponse.json(
        { message: 'Este e-mail já está cadastrado.' },
        { status: 409 },
      )
    }

    const user: RegisteredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordDigest: await digestPassword(password),
    }

    registeredUsers.push(user)
    saveRegisteredUsers(registeredUsers)

    return HttpResponse.json(
      {
        token: crypto.randomUUID(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    )
  }),

  http.post('/api/auth/social', async ({ request }) => {
    const body = (await request.json()) as { provider?: string }
    if (body.provider !== 'google' && body.provider !== 'facebook') {
      return HttpResponse.json({ message: 'Provedor de login inválido.' }, { status: 400 })
    }
    const provider = body.provider === 'google' ? 'Google' : 'Facebook'
    const email = `demo.${body.provider}@kurio.example`
    const users = loadRegisteredUsers()
    let user = users.find((entry) => entry.email === email)
    if (!user) {
      user = { id: crypto.randomUUID(), name: `Colecionador ${provider}`, email, passwordDigest: '' }
      users.push(user)
      saveRegisteredUsers(users)
    }
    return HttpResponse.json({ token: crypto.randomUUID(), user: { id: user.id, name: user.name, email: user.email } })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!email || !password) {
      return HttpResponse.json(
        { message: 'Informe seu e-mail e sua senha.' },
        { status: 400 },
      )
    }

    const passwordDigest = await digestPassword(password)
    const user = loadRegisteredUsers().find(
      (registeredUser) =>
        registeredUser.email === email &&
        registeredUser.passwordDigest === passwordDigest,
    )

    if (user) {
      return HttpResponse.json({
        token: crypto.randomUUID(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
    }

    const demoDigest = sessionStorage.getItem('kurio-demo-password-digest') ?? await digestPassword(demoPassword)
    if (email === demoUser.email && passwordDigest === demoDigest) {
      return HttpResponse.json({
        token: crypto.randomUUID(),
        user: demoUser,
      })
    }

    return HttpResponse.json(
      { message: 'E-mail ou senha inválidos.' },
      { status: 401 },
    )
  }),

  http.post('/api/auth/change-password', async ({ request }) => {
    const auth = requireUser()
    if ('error' in auth) return auth.error
    const body = await request.json() as { currentPassword?: string; newPassword?: string }
    if (!body.currentPassword || !body.newPassword || body.newPassword.length < 6) return HttpResponse.json({ message: 'Informe as senhas corretamente.' }, { status: 400 })
    const oldDigest = await digestPassword(body.currentPassword)
    const registeredUsers = loadRegisteredUsers()
    const user = registeredUsers.find((entry) => entry.id === auth.userId)
    if (auth.userId === demoUser.id) {
      const demoDigest = sessionStorage.getItem('kurio-demo-password-digest') ?? await digestPassword(demoPassword)
      if (oldDigest !== demoDigest) return HttpResponse.json({ message: 'Senha atual incorreta.' }, { status: 401 })
      sessionStorage.setItem('kurio-demo-password-digest', await digestPassword(body.newPassword))
    } else {
      if (!user || user.passwordDigest !== oldDigest) return HttpResponse.json({ message: 'Senha atual incorreta.' }, { status: 401 })
      user.passwordDigest = await digestPassword(body.newPassword)
      saveRegisteredUsers(registeredUsers)
    }
    return HttpResponse.json({ message: 'Senha alterada.' })
  }),

  http.all('*', ({ request }) => {
    if (new URL(request.url).pathname.startsWith('/api/')) {
      return HttpResponse.json({ message: 'Endpoint simulado não implementado.' }, { status: 501 })
    }
    return passthrough()
  }),
]
