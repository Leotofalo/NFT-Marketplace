import { expect, test } from '@playwright/test'

async function capture(page: import('@playwright/test').Page, name: string) {
  await page.evaluate(() => document.fonts.ready)
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  })
}

test('mantém as telas principais estáveis visualmente', async ({ page }) => {
  await page.routeWebSocket('**/socket.io/**', async (socket) => {
    await socket.close()
  })

  await page.goto('/')
  await expect(page.locator('h1').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Emerald Ape #042' })).toBeVisible()
  await capture(page, 'home')

  await page.goto('/nft/emerald-ape-042')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await capture(page, 'nft-detail')

  const email = 'visual-review@example.test'
  const password = 'Senha-ficticia-93'
  await page.goto('/register')
  await page.getByLabel('Nome completo').fill('Colecionador visual')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByLabel('Confirmar senha').fill(password)
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/wallets')
  await page.getByLabel('Nome de exibição').fill('Carteira visual')
  await page.getByLabel('Endereço').fill('0x1234567890abcdef')
  await page.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByText('Carteira visual · Principal')).toBeVisible()

  await page.goto('/nft/emerald-ape-042')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await page.goto('/cart')
  await expect(page.getByRole('navigation', { name: 'Navegação estrutural' }).getByText('Carrinho', { exact: true })).toBeVisible()
  await capture(page, 'cart')

  await page.goto('/payment')
  await expect(page.getByText('Carteira visual · Ethereum')).toBeVisible()
  await page.getByLabel('Nome de exibição').fill('Comprador visual')
  await page.getByLabel('Nome de usuário').fill('comprador-visual')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled()
  await capture(page, 'payment')
})
