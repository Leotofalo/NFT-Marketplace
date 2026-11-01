import { expect, test } from '@playwright/test'

async function setupBuyer(page: import('@playwright/test').Page) {
  const email = `buyer-${Date.now()}@example.test`
  await page.goto('/register')
  await page.getByLabel('Nome completo').fill('Colecionador comprador')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('Senha-ficticia-93')
  await page.getByLabel('Confirmar senha').fill('Senha-ficticia-93')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/wallets')
  await page.getByLabel('Nome de exibição').fill('Minha carteira')
  await page.getByLabel('Endereço').fill('0x1234567890abcdef')
  await page.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByText('Minha carteira · Principal')).toBeVisible()

  await page.goto('/')
  await page.getByRole('link', { name: 'Ver detalhes de Emerald Ape #042' }).click()
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  return email
}

async function fillPaymentProfile(page: import('@playwright/test').Page, email: string) {
  await page.getByLabel('Nome de exibição').fill('Comprador de teste')
  await page.getByLabel('Nome de usuário').fill('comprador-teste')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
}

test('visitante vê Entrar e a sessão demo antiga não autentica automaticamente', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('kurio-token', 'kurio-mock-session-token')
    localStorage.setItem('kurio-user', JSON.stringify({ id: 'collector-001', name: 'Colecionador Kurio', email: 'demo@kurio.com' }))
    localStorage.setItem('kurio-token-expires-at', String(Date.now() + 60 * 60 * 1000))
  })
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Minha conta' })).toHaveCount(0)
})

test('login social demonstra autenticação simulada sem provedor externo', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('Demonstração: sem conexão às contas Google ou Facebook.')).toBeVisible()
  await page.getByRole('button', { name: 'Continuar com Google' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('link', { name: 'Minha conta' })).toBeVisible()
  await page.evaluate(() => localStorage.clear())
  await page.goto('/login')
  await page.getByRole('button', { name: 'Continuar com Facebook' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('link', { name: 'Minha conta' })).toBeVisible()
})

test('sessão expirada redireciona para login antes de acessar a conta', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('kurio-token', 'expired-token')
    localStorage.setItem('kurio-user', JSON.stringify({ id: 'expired-user', name: 'Sessão expirada', email: 'expired@example.test' }))
    localStorage.setItem('kurio-token-expires-at', String(Date.now() - 1))
  })
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible()
})

test('cadastro e login mantêm o usuário mock após reload', async ({ page }) => {
  const email = `collector-${Date.now()}@example.test`
  const password = 'Senha-ficticia-93'

  await page.goto('/register')
  await page.getByLabel('Nome completo').fill('Colecionador de teste')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByLabel('Confirmar senha').fill(password)
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.reload()
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/$/)
})

test('perfil salva alterações e mantém os campos após recarregar', async ({ page }) => {
  const email = await setupBuyer(page)
  await page.goto('/profile')
  await page.getByLabel('Nome de exibição').fill('Perfil salvo')
  await page.getByLabel('Nome de usuário').fill('perfil-salvo')
  await page.getByLabel('Nome ENS').fill('colecionador.eth')
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(page.getByRole('status')).toHaveText('Perfil salvo.')
  await page.reload()
  await expect(page.getByLabel('Nome de exibição')).toHaveValue('Perfil salvo')
  await expect(page.getByLabel('Nome de usuário')).toHaveValue('perfil-salvo')
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue(email)
})

test('carteiras recuperam armazenamento antigo que não é uma lista', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('Nome completo').fill('Colecionador de teste')
  await page.getByLabel('E-mail', { exact: true }).fill(`wallet-${Date.now()}@example.test`)
  await page.getByLabel('Senha', { exact: true }).fill('Senha-ficticia-93')
  await page.getByLabel('Confirmar senha').fill('Senha-ficticia-93')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.evaluate(() => {
    const user = JSON.parse(localStorage.getItem('kurio-user') ?? '{}') as { id: string }
    localStorage.setItem(`kurio-wallets:${user.id}`, JSON.stringify({ oldFormat: true }))
  })
  await page.goto('/wallets')
  await expect(page.getByText('Nenhuma carteira cadastrada.')).toBeVisible()
})

test('busca do catálogo é refletida na URL e abre o detalhe', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Pesquisar NFTs' }).click()
  await page.getByRole('searchbox', { name: 'Pesquisar NFTs por nome ou categoria' }).fill('Emerald Ape')
  await expect(page).toHaveURL(/q=Emerald/)
  await page.getByRole('link', { name: 'Ver detalhes de Emerald Ape #042' }).click()
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByRole('status')).toContainText('adicionado ao seu carrinho')
})

test('detalhe inexistente apresenta estado 404 específico', async ({ page }) => {
  await page.goto('/nft/id-que-nao-existe')
  await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Voltar ao marketplace' })).toBeVisible()
})

test('preços de catálogo oscilam e o filtro de rede funciona', async ({ page }) => {
  await page.goto('/?scenario=nft-updated&q=Golden%20Signal')
  const card = page.getByRole('link', { name: 'Ver detalhes de Golden Signal #160' })
  await expect(card).toBeVisible()
  const price = card.locator('p').last()
  await expect(price).toHaveText(/0\.(39|49|55|43) POL/, { timeout: 5_000 })
  const firstPrice = await price.textContent()
  await expect.poll(async () => price.textContent(), { timeout: 5_000 }).not.toBe(firstPrice)

  await page.goto('/')
  const networkCheckbox = page.locator(page.viewportSize()!.width < 1024
    ? 'input[aria-label="Polygon mobile"]'
    : 'input[aria-label="Polygon"]:visible')
  await networkCheckbox.check()
  await expect(page).toHaveURL(/networks=/)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Neon Vessel #552' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Neon Vessel #552' }).locator('p').last()).toHaveText(/POL$/)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Emerald Ape #042' })).toHaveCount(0)
  await expect(page.locator('a[aria-label^="Ver detalhes de"]').filter({ has: page.locator('p', { hasText: /POL$/ }) })).toHaveCount(5)

  await page.goto('/')
  const solanaCheckbox = page.locator(page.viewportSize()!.width < 1024
    ? 'input[aria-label="Solana mobile"]'
    : 'input[aria-label="Solana"]:visible')
  await solanaCheckbox.check()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Violet Nomad #314' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Violet Nomad #314' }).locator('p').last()).toHaveText(/SOL$/)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Emerald Ape #042' })).toHaveCount(0)
  await expect(page.locator('a[aria-label^="Ver detalhes de"]').filter({ has: page.locator('p', { hasText: /SOL$/ }) })).toHaveCount(4)
})

test('fluxo de pedido confirma e mostra o recibo da API simulada', async ({ page }) => {
  const email = await setupBuyer(page)
  await page.goto('/payment')
  await fillPaymentProfile(page, email)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible()
  await expect(page.getByText(/ID da transação/)).toBeVisible()
  await page.goto('/wallets')
  await expect(page.getByRole('heading', { name: /NFTs nesta carteira/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Emerald Ape #042' }).last()).toBeVisible()
})

test('pagamento recusado preserva o carrinho', async ({ page }) => {
  const email = await setupBuyer(page)
  await page.goto('/payment?scenario=declined')
  await fillPaymentProfile(page, email)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('alert')).toContainText('Pagamento recusado')
  await page.getByRole('link', { name: '← Voltar ao carrinho' }).click()
  await expect(page.getByText('1 edição no carrinho')).toBeVisible()
})

test('timeout após criação recupera o mesmo pedido ao reenviar', async ({ page }) => {
  const email = await setupBuyer(page)
  await page.goto('/payment?scenario=timeout-after-create')
  await fillPaymentProfile(page, email)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('alert')).toContainText('Tempo limite após criar o pedido')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible()
})

test('cotação alterada durante o pagamento exige nova confirmação', async ({ page }) => {
  await page.routeWebSocket('**/socket.io/**', async (socket) => { await socket.close() })
  const email = await setupBuyer(page)
  await page.goto('/payment')
  await fillPaymentProfile(page, email)
  await page.evaluate(() => localStorage.setItem('kurio-nft-price:emerald-ape-042', '1.50 ETH'))

  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('alert')).toContainText('preço de um NFT mudou')
  await expect(page.getByText('1.50 ETH')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pagamento' })).toBeVisible()

  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible()
})
