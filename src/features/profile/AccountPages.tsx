import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { api } from '../../services/api'
import axios from 'axios'
import { useCart } from '../cart/useCart'
import { nftData } from '../nft/nftData'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { MobileNavigation } from '../../components/layout/MobileNavigation'
import { clearSession, getSessionUserId, hasValidSession } from '../../services/session'

type OwnedNFT = { id: string; name: string; image: string; price: string; quantity: number }
type Wallet = { id: string; name: string; network: string; address: string; type?: string; primary?: boolean; nfts?: OwnedNFT[] }
type Profile = { displayName: string; username: string; email: string; ens: string; avatar?: string }
const emptyProfile: Profile = { displayName: '', username: '', email: '', ens: '' }

function normalizeWallets(value: unknown): Wallet[] {
  if (!Array.isArray(value)) return []
  const validWallets = value.filter((wallet): wallet is Wallet =>
    typeof wallet === 'object' && wallet !== null &&
    'id' in wallet && typeof wallet.id === 'string' &&
    'name' in wallet && typeof wallet.name === 'string' &&
    'network' in wallet && typeof wallet.network === 'string' &&
    'address' in wallet && typeof wallet.address === 'string',
  )
  return validWallets.map((wallet) => ({
    ...wallet,
    nfts: Array.isArray(wallet.nfts) ? wallet.nfts.filter((nft): nft is OwnedNFT =>
      typeof nft === 'object' && nft !== null &&
      'id' in nft && typeof nft.id === 'string' &&
      'name' in nft && typeof nft.name === 'string' &&
      'image' in nft && typeof nft.image === 'string' &&
      'price' in nft && typeof nft.price === 'string' &&
      'quantity' in nft && typeof nft.quantity === 'number',
    ) : [],
  }))
}

function readStoredProfile(): Partial<Profile> {
  const userId = getSessionUserId()
  if (!userId) return {}
  try {
    const value: unknown = JSON.parse(localStorage.getItem(`kurio-profile:${userId}`) ?? 'null')
    return typeof value === 'object' && value !== null ? value as Partial<Profile> : {}
  } catch { return {} }
}

function PageShell({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('')
  return <div className="min-h-screen bg-ink text-foreground"><Header searchValue={search} onSearchChange={setSearch} />{children}<Footer /><MobileNavigation /></div>
}

function useRequireSession() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!hasValidSession()) {
      sessionStorage.setItem('kurio-return-to', window.location.pathname)
      clearSession()
      void navigate({ to: '/login' })
    }
  }, [navigate])
}

function AccountLayout({ title, children }: { title: string; children: ReactNode }) {
  return <PageShell><main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 pb-28 sm:px-6 md:grid-cols-[260px_1fr] lg:px-8">
    <nav className="h-fit rounded-xl border border-border bg-surface-card p-4" aria-label="Minha conta">
      <h1 className="mb-4 text-lg font-bold">Meu perfil</h1>
      <div className="flex gap-3 overflow-x-auto md:flex-col">
        <Link to="/profile" className="whitespace-nowrap py-2 text-primary">Dados do perfil</Link>
        <Link to="/wallets" className="whitespace-nowrap py-2 text-primary">Carteiras</Link>
      <button className="whitespace-nowrap py-2 text-left text-text-secondary" onClick={() => { void api.post('/auth/logout').finally(() => { clearSession(); window.location.assign('/') }) }}>Sair</button>
      </div>
    </nav>
    <section className="min-w-0 rounded-xl border border-border bg-surface-card p-5 sm:p-8">
      <h2 className="mb-6 text-xl font-bold">{title}</h2>{children}
    </section>
  </main></PageShell>
}

export function ProfilePage() {
  useRequireSession()
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [message, setMessage] = useState('Carregando perfil…')
  const [saving, setSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  useEffect(() => {
    api.get<Profile>('/profile').then(({ data }) => {
      setProfile({ ...emptyProfile, ...data, ...readStoredProfile() })
      setMessage('')
    }).catch(() => setMessage('Não foi possível carregar o perfil.'))
  }, [])
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('')
    try {
      const { data } = await api.put<Profile>('/profile', profile)
      setProfile({ ...emptyProfile, ...data })
      setMessage('Perfil salvo.')
    }
    catch { setMessage('Não foi possível salvar o perfil. Tente novamente.') }
    finally { setSaving(false) }
  }
  async function changePassword(event: FormEvent) {
    event.preventDefault(); setMessage('')
    if (newPassword.length < 6 || newPassword !== confirmPassword) { setMessage('Confira a nova senha e a confirmação (mínimo de 6 caracteres).'); return }
    try { await api.post('/auth/change-password', { currentPassword, newPassword }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setMessage('Senha alterada.') }
    catch { setMessage('Não foi possível alterar a senha. Confira a senha atual.') }
  }
  return <AccountLayout title="Perfil do colecionador">
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      {([['displayName','Nome de exibição'],['username','Nome de usuário'],['email','E-mail'],['ens','Nome ENS']] as const).map(([key,label]) => <label key={key} className="grid gap-2 text-sm">{label}<input required={key !== 'ens'} type={key === 'email' ? 'email' : 'text'} value={profile[key]} onChange={e => setProfile({ ...profile, [key]: e.target.value })} className="rounded-lg border border-border bg-ink px-3 py-3" /></label>)}
      <div className="flex items-center gap-4 sm:col-span-2">{profile.avatar ? <img src={profile.avatar} alt="Avatar do perfil" className="h-14 w-14 rounded-full object-cover" /> : <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised text-primary">♙</span>}<label className="grid gap-2 text-sm">Avatar<input type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 2_000_000) { setMessage('O avatar deve ter até 2 MB.'); return } const reader = new FileReader(); reader.onload = () => setProfile({ ...profile, avatar: String(reader.result) }); reader.readAsDataURL(file) }} className="max-w-full text-xs" /></label>{profile.avatar && <button type="button" onClick={() => setProfile({ ...profile, avatar: undefined })} className="text-sm text-primary">Remover</button>}</div>
      <button disabled={saving} className="rounded-lg bg-primary px-5 py-3 font-bold text-ink sm:col-span-2">{saving ? 'Salvando…' : 'Salvar perfil'}</button>
    </form>
    <form onSubmit={changePassword} className="mt-10 grid max-w-xl gap-4">
      <h3 className="font-bold">Alterar senha</h3>
      <label className="grid gap-2 text-sm">Senha atual<input required type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="rounded-lg border border-border bg-ink px-3 py-3" /></label>
      <label className="grid gap-2 text-sm">Nova senha<input required minLength={6} type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-lg border border-border bg-ink px-3 py-3" /></label>
      <label className="grid gap-2 text-sm">Confirmar nova senha<input required minLength={6} type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="rounded-lg border border-border bg-ink px-3 py-3" /></label>
      <button className="w-fit rounded-lg border border-primary px-5 py-3 font-bold text-primary">Alterar senha</button>
    </form>
    {message && <p role="status" className="mt-5 text-sm text-primary">{message}</p>}
  </AccountLayout>
}

export function WalletsPage() {
  useRequireSession()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [form, setForm] = useState({ name: '', network: 'Ethereum', address: '', type: 'MetaMask' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('Carregando carteiras…')
  async function reload() { try { const { data } = await api.get<unknown>('/wallets'); const validWallets = normalizeWallets(data); setWallets(validWallets); setMessage(validWallets.length ? '' : 'Nenhuma carteira cadastrada.') } catch { setWallets([]); setMessage('Não foi possível carregar as carteiras.') } }
  useEffect(() => {
    api.get<unknown>('/wallets').then(({ data }) => {
      const validWallets = normalizeWallets(data)
      setWallets(validWallets)
      setMessage(validWallets.length ? '' : 'Nenhuma carteira cadastrada.')
    }).catch(() => { setWallets([]); setMessage('Não foi possível carregar as carteiras.') })
  }, [])
  async function add(event: FormEvent) { event.preventDefault(); setMessage(''); try { if (editingId) await api.put(`/wallets/${editingId}`, form); else await api.post('/wallets', form); setForm({ ...form, name: '', address: '' }); setEditingId(null); await reload() } catch (error) { setMessage((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Falha ao salvar a carteira.') } }
  async function remove(id: string) { try { await api.delete(`/wallets/${id}`); await reload() } catch { setMessage('Não foi possível remover a carteira.') } }
  return <AccountLayout title="Carteiras">
    <p className="mb-6 text-sm text-text-secondary">Cadastre carteiras simuladas para selecioná-las durante o pagamento.</p>
    <div className="space-y-4">{wallets.map(wallet => {
      const ownedNFTs = Array.isArray(wallet.nfts) ? wallet.nfts : []
      return <article key={wallet.id} className="rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><strong>{wallet.name}{wallet.primary ? ' · Principal' : ''}</strong><p className="mt-1 text-sm text-text-secondary">{wallet.network} · {wallet.address}</p></div><div className="flex gap-4"><button onClick={() => { setEditingId(wallet.id); setForm({ name: wallet.name, network: wallet.network, address: wallet.address, type: wallet.type ?? 'MetaMask' }) }} className="text-sm text-primary">Editar</button><button onClick={() => void remove(wallet.id)} className="text-sm text-primary">Remover</button></div></div>
        <section aria-label={`NFTs na carteira ${wallet.name}`} className="mt-5 border-t border-border pt-4"><h3 className="mb-3 text-sm font-bold">NFTs nesta carteira <span className="text-text-secondary">({ownedNFTs.length})</span></h3>
          {ownedNFTs.length ? <ul className="grid gap-3 sm:grid-cols-2">{ownedNFTs.map(nft => <li key={nft.id} className="flex items-center gap-3 rounded-lg bg-ink p-3"><Link to="/nft/$nftId" params={{ nftId: nft.id }} className="h-14 w-14 shrink-0 overflow-hidden rounded-md"><img src={nft.image} alt={nft.name} className="h-full w-full object-cover" /></Link><div className="min-w-0"><Link to="/nft/$nftId" params={{ nftId: nft.id }} className="block truncate text-sm font-semibold hover:text-primary">{nft.name}</Link><p className="mt-1 text-xs text-text-secondary">{nft.price} · {nft.quantity} {nft.quantity === 1 ? 'edição' : 'edições'}</p></div></li>)}</ul> : <p className="text-sm text-text-secondary">Nenhum NFT foi comprado para esta carteira ainda.</p>}
        </section>
      </article>
    })}</div>
    <form onSubmit={add} className="mt-8 grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm">Nome de exibição<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-border bg-ink px-3 py-3" /></label>
      <label className="grid gap-2 text-sm">Tipo<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-border bg-ink px-3 py-3"><option>MetaMask</option><option>WalletConnect</option><option>Coinbase Wallet</option></select></label>
      <label className="grid gap-2 text-sm">Rede<select value={form.network} onChange={e => setForm({ ...form, network: e.target.value })} className="rounded-lg border border-border bg-ink px-3 py-3"><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></label>
      <label className="grid gap-2 text-sm">Endereço<input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Endereço fictício para demonstração" className="rounded-lg border border-border bg-ink px-3 py-3" /></label>
      <div className="flex gap-3 sm:col-span-2"><button className="rounded-lg bg-primary px-5 py-3 font-bold text-ink">{editingId ? 'Atualizar carteira' : 'Salvar carteira'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', network: 'Ethereum', address: '', type: 'MetaMask' }) }} className="rounded-lg border border-border px-5 py-3">Cancelar</button>}</div>
    </form>
    {message && <p role="status" className="mt-5 text-sm text-primary">{message}</p>}
  </AccountLayout>
}

type Order = { id: string; status: string; transactionId: string; createdAt: string; collector?: Profile; wallet: string; network: string; total: string; fee: string; items: Array<{ id: string; name: string; price: string; quantity: number; image: string }> }
type CheckoutQuote = { subtotal: string; discount: string; fee: string; total: string }
export function PaymentPage() {
  useRequireSession()
  const navigate = useNavigate()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [walletId, setWalletId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [collector, setCollector] = useState<Profile>(emptyProfile)
  const { items, clearCart } = useCart()
  const [quotePrices, setQuotePrices] = useState<Record<string, string>>(() => Object.fromEntries(items.map((item) => {
    const basePrice = nftData.find((nft) => nft.id === item.nftId)?.price ?? '0 ETH'
    return [item.nftId, localStorage.getItem(`kurio-nft-price:${item.nftId}`) ?? basePrice]
  })))
  const [quote, setQuote] = useState<CheckoutQuote | null>(null)
  const subtotalMilli = items.reduce((sum, item) => sum + Math.round(Number(quotePrices[item.nftId]?.match(/[\d.]+/)?.[0] ?? 0) * 1000) * item.quantity, 0)
  const discountMilli = sessionStorage.getItem('kurio-coupon') === 'GENESIS10' ? Math.round(subtotalMilli / 10) : 0
  const fallbackQuote: CheckoutQuote = {
    subtotal: (subtotalMilli / 1000).toFixed(3),
    discount: (discountMilli / 1000).toFixed(3),
    fee: items.length ? '0.016' : '0.000',
    total: ((subtotalMilli - discountMilli + (items.length ? 16 : 0)) / 1000).toFixed(3),
  }
  useEffect(() => {
    api.get<unknown>('/wallets').then(({ data }) => { const validWallets = normalizeWallets(data); setWallets(validWallets); setWalletId(validWallets[0]?.id ?? '') }).catch(() => { setWallets([]); setMessage('Não foi possível carregar suas carteiras.') })
    api.get<Profile>('/profile').then(({ data }) => setCollector(data)).catch(() => undefined)
  }, [])
  async function confirm(event: FormEvent) {
    event.preventDefault()
    if (!walletId) { setMessage('Cadastre e selecione uma carteira antes de continuar.'); return }
    if (!items.length) { setMessage('Seu carrinho está vazio.'); return }
    setLoading(true); setMessage('')
    const wallet = wallets.find(item => item.id === walletId)!
    const key = localStorage.getItem('kurio-pending-order-key') ?? crypto.randomUUID()
    localStorage.setItem('kurio-pending-order-key', key)
    try {
      const coupon = sessionStorage.getItem('kurio-coupon') ?? undefined
      const validation = await api.post<{ valid: boolean; items: Array<{ nftId: string; message?: string; price?: string }>; quote?: CheckoutQuote }>('/cart/validate', { items, coupon })
      if (!validation.data.valid) throw new Error(validation.data.items.find(item => item.message)?.message ?? 'Revise os itens do carrinho.')
      const latestPrices = Object.fromEntries(validation.data.items.flatMap((item) => item.price ? [[item.nftId, item.price]] : []))
      const priceChanged = Object.entries(latestPrices).some(([nftId, price]) => quotePrices[nftId] !== price)
      setQuote(validation.data.quote ?? null)
      if (priceChanged) {
        setQuotePrices(latestPrices)
        setMessage('O preço de um NFT mudou durante a revisão. Confira a nova cotação e confirme novamente.')
        return
      }
      await api.put('/profile', collector)
      const scenario = new URLSearchParams(window.location.search).get('scenario') ?? undefined
      const { data } = await api.post<Order>('/orders', { items, expectedPrices: quotePrices, walletId: wallet.id, wallet: wallet.name, network: wallet.network, coupon, collector, scenario }, { headers: { 'Idempotency-Key': key } })
      clearCart(); localStorage.removeItem('kurio-pending-order-key')
      sessionStorage.removeItem('kurio-coupon')
      await navigate({ to: '/orders/$orderId', params: { orderId: data.id } })
    } catch (error) {
      const apiData = axios.isAxiosError<{ code?: string; message?: string; items?: Array<{ nftId: string; price: string }> }>(error) ? error.response?.data : undefined
      if (apiData?.code === 'PRICE_CHANGED' && apiData.items) {
        setQuotePrices(Object.fromEntries(apiData.items.map((item) => [item.nftId, item.price])))
        setQuote(null)
        setMessage(apiData.message ?? 'O preço mudou durante a revisão. Confira a nova cotação e confirme novamente.')
        return
      }
      const apiMessage = apiData?.message
      setMessage(apiMessage ?? (error instanceof Error ? error.message : 'Não foi possível concluir o pedido.') + ' Seus itens continuam no carrinho.')
    } finally { setLoading(false) }
  }
  return <PageShell><main className="mx-auto max-w-5xl px-4 py-10 pb-28 sm:px-6">
    <Link to="/cart" className="text-sm text-primary">← Voltar ao carrinho</Link>
    <h1 className="my-6 text-2xl font-bold">Pagamento</h1>
    <form onSubmit={confirm} className="grid gap-8 md:grid-cols-[1fr_360px]">
      <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-7"><h2 className="mb-5 font-bold">Perfil do colecionador</h2>
        <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm">Nome de exibição<input required value={collector.displayName} onChange={e => setCollector({ ...collector, displayName: e.target.value })} className="rounded-lg border border-border bg-ink p-3" /></label><label className="grid gap-2 text-sm">Nome de usuário<input required value={collector.username} onChange={e => setCollector({ ...collector, username: e.target.value })} className="rounded-lg border border-border bg-ink p-3" /></label><label className="grid gap-2 text-sm">E-mail<input type="email" required value={collector.email} onChange={e => setCollector({ ...collector, email: e.target.value })} className="rounded-lg border border-border bg-ink p-3" /></label><label className="grid gap-2 text-sm">Rede<select value={wallets.find(w => w.id === walletId)?.network ?? 'Ethereum'} onChange={e => { const target = wallets.find(w => w.network === e.target.value); if (target) setWalletId(target.id) }} className="rounded-lg border border-border bg-ink p-3"><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></label></div>
        <h2 className="mb-4 mt-8 font-bold">Carteira</h2>{wallets.length ? <div className="space-y-3">{wallets.map(wallet => <label key={wallet.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4"><input type="radio" name="wallet" checked={walletId === wallet.id} onChange={() => setWalletId(wallet.id)} /><span>{wallet.name} · {wallet.network}</span></label>)}</div> : <p className="text-sm text-text-secondary">Cadastre uma carteira em <Link to="/wallets" className="text-primary underline">Carteiras</Link>.</p>}
      </section>
      <aside className="h-fit rounded-xl border border-border bg-surface-card p-5"><h2 className="mb-4 font-bold">Revisão do pedido</h2>{items.map(item => { const nft = nftData.find(entry => entry.id === item.nftId); return <div key={item.nftId} className="flex justify-between gap-3 border-b border-border py-3 text-sm"><span>{nft?.name ?? item.nftId} × {item.quantity}</span><span className="shrink-0">{quotePrices[item.nftId]}</span></div> })}<dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt>Subtotal</dt><dd>{quote?.subtotal ?? fallbackQuote.subtotal} ETH</dd></div><div className="flex justify-between gap-3"><dt>Desconto</dt><dd>{quote?.discount ?? fallbackQuote.discount} ETH</dd></div><div className="flex justify-between gap-3"><dt>Taxa de rede</dt><dd>{quote?.fee ?? fallbackQuote.fee} ETH</dd></div><div className="flex justify-between gap-3 border-t border-border pt-3 font-bold"><dt>Total</dt><dd className="text-primary">{quote?.total ?? fallbackQuote.total} ETH</dd></div></dl><button disabled={loading || !items.length} className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-bold text-ink disabled:opacity-50">{loading ? 'Confirmando…' : 'Confirmar compra'}</button>{message && <p role="alert" className="mt-4 text-sm text-red-400">{message}</p>}</aside>
    </form>
  </main></PageShell>
}

export function OrderConfirmationPage() {
  useRequireSession()
  const { orderId } = useParams({ from: '/orders/$orderId' })
  const [order, setOrder] = useState<Order | null>(null)
  const [message, setMessage] = useState('Carregando pedido…')
  useEffect(() => {
    api.get<Order>(`/orders/${encodeURIComponent(orderId)}`).then(({ data }) => { setOrder(data); setMessage('') }).catch(() => setMessage('Não foi possível localizar este pedido confirmado.'))
  }, [orderId])
  if (!order) return <PageShell><main className="mx-auto max-w-2xl px-4 py-16 text-center"><p role="status">{message}</p><Link to="/cart" className="mt-5 inline-block text-primary">Voltar ao carrinho</Link></main></PageShell>
  return <PageShell><main className="mx-auto max-w-2xl px-4 py-12 pb-28"><section className="rounded-xl border border-border bg-surface-card p-6 sm:p-10"><div className="text-center"><p className="text-4xl text-primary">✓</p><h1 className="mt-3 text-xl font-bold">Pedido confirmado</h1><p className="mt-2 text-sm text-text-secondary">Seus NFTs foram adicionados à sua carteira simulada.</p></div><dl className="my-6 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm"><dt>ID da transação</dt><dd className="text-right">{order.transactionId}</dd><dt>Carteira</dt><dd className="text-right">{order.wallet}</dd><dt>Rede</dt><dd className="text-right">{order.network}</dd></dl><h2 className="mb-3 font-bold">Detalhes da transação</h2>{order.items.map(item => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm"><span>{item.name} × {item.quantity}</span><span className="text-primary">{(Number(item.price.match(/[\d.]+/)?.[0] ?? 0) * item.quantity).toFixed(3)} ETH</span></div>)}<p className="mt-5 text-right text-sm">Taxa de rede: {order.fee} ETH</p><p className="mt-2 text-right text-lg font-bold text-primary">Total: {order.total} ETH</p><Link to="/" className="mt-8 block rounded-lg bg-primary px-5 py-3 text-center font-bold text-ink">Voltar ao marketplace</Link></section></main></PageShell>
}
