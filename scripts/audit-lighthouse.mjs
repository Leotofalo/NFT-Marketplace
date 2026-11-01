import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localBrowserPath = path.join(root, '.playwright-browsers')
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(localBrowserPath)) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = localBrowserPath
}
const { chromium } = await import('@playwright/test')
const outputDir = path.join(root, 'lighthouse-reports')
const host = '127.0.0.1'
const port = 4173
const origin = `http://${host}:${port}`
const runs = Number(process.env.LIGHTHOUSE_RUNS ?? 3)
const lighthouseCli = path.join(root, 'node_modules', 'lighthouse', 'cli', 'index.js')
const chrome = chromium.executablePath()
const scores = []

function execute(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', ...options })
    child.once('error', reject)
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)))
  })
}

await mkdir(outputDir, { recursive: true })
if (!process.env.npm_execpath) throw new Error('Run this audit with `npm run audit:lighthouse`.')
await execute(process.execPath, [process.env.npm_execpath, 'run', 'build:demo'])
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
const preview = spawn(process.execPath, [viteCli, 'preview', '--host', host, '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: 'inherit',
})

try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(origin)
      if (response.ok) { ready = true; break }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  if (!ready) throw new Error('Vite preview did not start on port 4173.')

  const browser = await chromium.launch({ headless: true })
  const browserVersion = browser.version()
  await browser.close()

  const pages = [
    { name: 'home', url: `${origin}/` },
    { name: 'nft-detail', url: `${origin}/nft/emerald-ape-042` },
  ]
  const profiles = [
    { name: 'mobile', args: ['--form-factor=mobile', '--screenEmulation.width=390', '--screenEmulation.height=844', '--screenEmulation.deviceScaleFactor=1', '--screenEmulation.mobile=true'] },
    { name: 'desktop', args: ['--preset=desktop'] },
  ]

  for (const page of pages) {
    for (const profile of profiles) {
      for (let run = 1; run <= runs; run += 1) {
        const stem = path.join(outputDir, `${page.name}-${profile.name}-${run}`)
        await execute(process.execPath, [
          lighthouseCli,
          page.url,
          '--output=html,json',
          `--output-path=${stem}`,
          '--only-categories=performance,accessibility,best-practices,seo',
          '--chrome-flags=--headless --no-sandbox',
          '--quiet',
          ...profile.args,
        ], { env: { ...process.env, CHROME_PATH: chrome } })

        const report = JSON.parse(await readFile(`${stem}.report.json`, 'utf8'))
        scores.push({
          page: page.name,
          profile: profile.name,
          run,
          categories: Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, Math.round(value.score * 100)])),
          lcpMs: Math.round(report.audits['largest-contentful-paint'].numericValue),
          cls: Number(report.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
          tbtMs: Math.round(report.audits['total-blocking-time'].numericValue),
        })
      }
    }
  }

  const med = (values) => {
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[middle] : Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(1))
  }
  const lines = [
    '# Lighthouse',
    '',
    `Data: ${new Date().toISOString()}`,
    `Node: ${process.version}; Lighthouse: ${(await import('lighthouse/package.json', { with: { type: 'json' } })).default.version}; Chromium: ${browserVersion}`,
    `Playwright: ${JSON.parse(await readFile(path.join(root, 'node_modules', '@playwright', 'test', 'package.json'), 'utf8')).version}; ambiente: ${os.platform()} ${os.release()} ${os.arch()} (${os.cpus()[0]?.model.trim() ?? 'CPU não identificada'}).`,
    `Build: npm run build:demo; origem: ${origin}; execuções por página/perfil: ${runs}.`,
    'Perfil mobile: viewport 390×844 com simulação padrão de Lighthouse; perfil desktop: preset Lighthouse desktop. Cache e armazenamento são reiniciados por execução; os mocks padrão estão ativos.',
    '',
    '| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]

  for (const page of pages) {
    for (const profile of profiles) {
      const group = scores.filter((score) => score.page === page.name && score.profile === profile.name)
      const categories = ['performance', 'accessibility', 'best-practices', 'seo']
      const values = categories.map((key) => med(group.map((score) => score.categories[key])))
      lines.push(`| ${page.name} | ${profile.name} | ${values[0]} | ${values[1]} | ${values[2]} | ${values[3]} | ${med(group.map((score) => score.lcpMs))} | ${med(group.map((score) => score.cls))} | ${med(group.map((score) => score.tbtMs))} |`)
    }
  }

  await writeFile(path.join(outputDir, 'summary.md'), `${lines.join('\n')}\n`)
  await writeFile(path.join(outputDir, 'runs.json'), `${JSON.stringify(scores, null, 2)}\n`)
} finally {
  preview.kill('SIGTERM')
}
