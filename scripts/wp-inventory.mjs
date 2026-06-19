#!/usr/bin/env node
/**
 * Inventário WordPress → data/wp-inventory.json (fora do Git)
 * Uso: node scripts/wp-inventory.mjs
 * Requer WP_SITE_URL e WP_SITE_PASSWORD no .env
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

function projectRoot() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  if (scriptDir.endsWith(`${path.sep}scripts`)) return path.resolve(scriptDir, '..')
  return scriptDir
}

function loadEnv(filePath) {
  const env = {}
  if (!fs.existsSync(filePath)) return env
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

async function fetchUnlocked(base, password, pathname) {
  const res = await fetch(`${base}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `post_password=${encodeURIComponent(password)}`,
    redirect: 'follow',
  })
  return { html: await res.text(), url: res.url }
}

function extractPortfolioLinks(html, base) {
  const host = new URL(base).hostname
  const pattern = new RegExp(
    `href="(https://${host.replace(/\./g, '\\.')}/portfolio/[^"#?]+/)"`,
    'g'
  )
  return [...new Set([...html.matchAll(pattern)].map((m) => m[1]))].filter(
    (url) => !url.endsWith('/feed/')
  )
}

function extractTitle(html) {
  const og = html.match(/property="og:title"\s+content="([^"]+)"/)
  if (og) return stripHtml(og[1])
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1) return stripHtml(h1[1])
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)
  return title ? stripHtml(title[1]) : ''
}

function slugFromUrl(url) {
  const parts = new URL(url).pathname.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? ''
}

async function main() {
  const root = projectRoot()
  const env = { ...loadEnv(path.join(root, '.env')), ...loadEnv(path.join(root, '.env.local')) }

  const siteUrl = env.WP_SITE_URL?.replace(/\/$/, '')
  const password = env.WP_SITE_PASSWORD

  if (!siteUrl || !password) {
    console.error('Defina WP_SITE_URL e WP_SITE_PASSWORD no .env')
    process.exit(1)
  }

  console.log('Acessando /portfolio/ …')
  const { html: portfolioHtml } = await fetchUnlocked(siteUrl, password, '/portfolio/')

  if (portfolioHtml.includes('protegido por senha')) {
    console.error('Senha incorreta ou site ainda bloqueado.')
    process.exit(1)
  }

  const caseUrls = extractPortfolioLinks(portfolioHtml, siteUrl)
  console.log(`Encontrados ${caseUrls.length} cases no grid.`)

  const items = []
  for (const url of caseUrls) {
    console.log(`  → ${slugFromUrl(url)}`)
    const { html } = await fetchUnlocked(siteUrl, password, new URL(url).pathname)
    items.push({
      slug: slugFromUrl(url),
      title: extractTitle(html),
      url,
      type: 'portfolio',
      status: 'publish',
    })
  }

  const outDir = path.join(root, 'data')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'wp-inventory.json')

  const report = {
    generated_at: new Date().toISOString(),
    site: siteUrl,
    portfolio_url: `${siteUrl}/portfolio/`,
    total: items.length,
    items,
  }

  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')
  console.log(`\nInventário salvo: ${outPath}`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
