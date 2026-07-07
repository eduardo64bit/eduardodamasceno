#!/usr/bin/env node
/**
 * Importa cases do WordPress → SQLite + data/media/
 * Pré-requisito: node scripts/wp-inventory.mjs
 * Uso: node scripts/wp-import.mjs [--force]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import Database from 'better-sqlite3'
import { resolveSiteDbPath } from './lib/site-db-path.mjs'

const force = process.argv.includes('--force')

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

function decodeHtml(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extFromUrl(url) {
  try {
    const p = new URL(url).pathname
    const ext = path.extname(p.split('?')[0])
    if (ext && ext.length <= 5) return ext
  } catch {
    /* ignore */
  }
  return '.jpg'
}

async function fetchUnlocked(base, password, pathname) {
  const res = await fetch(`${base}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `post_password=${encodeURIComponent(password)}`,
    redirect: 'follow',
  })
  return res.text()
}

class CookieJar {
  /** @type {Map<string, string>} */
  #cookies = new Map()

  ingest(response) {
    for (const raw of response.headers.getSetCookie?.() ?? []) {
      const pair = raw.split(';')[0]
      const eq = pair.indexOf('=')
      if (eq === -1) continue
      this.#cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim())
    }
  }

  header() {
    return [...this.#cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
  }
}

async function fetchWithJar(url, jar, init = {}) {
  const headers = new Headers(init.headers)
  const cookie = jar.header()
  if (cookie) headers.set('Cookie', cookie)
  const res = await fetch(url, { ...init, headers })
  jar.ingest(res)
  return res
}

async function unlockCase(caseUrl, passwords, siteUrl) {
  const list = Array.isArray(passwords) ? passwords : [passwords]
  let lastHtml = ''

  for (const password of list) {
    const html = await unlockCaseWithPassword(caseUrl, password, siteUrl)
    lastHtml = html
    if (!isLockedHtml(html)) return html
  }

  return lastHtml
}

async function unlockCaseWithPassword(caseUrl, password, siteUrl) {
  const jar = new CookieJar()
  const base = siteUrl.replace(/\/$/, '')

  // Site-wide password (desbloqueia /portfolio/ e páginas filhas no WP.com)
  await fetchWithJar(`${base}/portfolio/`, jar, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `post_password=${encodeURIComponent(password)}`,
    redirect: 'follow',
  })

  const first = await fetchWithJar(caseUrl, jar)
  let html = await first.text()
  if (!isLockedHtml(html)) return html

  const redirectTo = html.match(/name="redirect_to" value="([^"]+)"/)?.[1] ?? caseUrl
  const loginAction = `${base}/wp-login.php?action=postpass`

  const postRes = await fetchWithJar(loginAction, jar, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      post_password: password,
      redirect_to: redirectTo,
      Submit: 'Entrar',
    }),
    redirect: 'manual',
  })

  const location = postRes.headers.get('location') ?? redirectTo
  const final = await fetchWithJar(location, jar, { redirect: 'follow' })
  return final.text()
}

function isLockedHtml(html) {
  return html.includes('post-password-form') || html.includes('post-password-required')
}

async function fetchCaseHtml(caseUrl, passwords, siteUrl) {
  return unlockCase(caseUrl, passwords, siteUrl)
}

function collectPasswords(fileEnv) {
  const post = process.env.WP_POST_PASSWORD || fileEnv.WP_POST_PASSWORD
  const site = process.env.WP_SITE_PASSWORD || fileEnv.WP_SITE_PASSWORD
  const list = []
  if (post) list.push(post)
  if (site && !list.includes(site)) list.push(site)
  return list
}

function parsePortfolioGrid(html, siteHost) {
  const map = new Map()
  const re = new RegExp(
    `<a href="(https://${siteHost.replace(/\./g, '\\.')}/portfolio/([^"/]+)/)"[\\s\\S]*?<img[^>]+src="([^"]+)"`,
    'gi'
  )
  for (const m of html.matchAll(re)) {
    const slug = m[2]
    if (slug === 'feed') continue
    map.set(slug, { coverUrl: m[3].split('?')[0] + '?w=1200', url: m[1] })
  }
  return map
}

function extractEntryContent(html) {
  if (isLockedHtml(html)) return ''

  const match = html.match(
    /<div class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<!-- \.entry-content -->|<footer|<div class="entry-meta")/i
  )
  const content = match?.[1]?.trim() ?? ''
  if (content.includes('post-password-form')) return ''
  return content
}

function extractSubtitle(html) {
  const h2 = html.match(/<h2[^>]*class="[^"]*entry-subtitle[^"]*"[^>]*>([\s\S]*?)<\/h2>/i)
  if (h2) return decodeHtml(h2[1].replace(/<[^>]+>/g, ''))
  const sub = html.match(/<p class="portfolio-subtitle[^"]*">([\s\S]*?)<\/p>/i)
  if (sub) return decodeHtml(sub[1].replace(/<[^>]+>/g, ''))
  return ''
}

function extractYoutube(html) {
  const embed = html.match(/youtube\.com\/embed\/([^"?&]+)/)
  if (embed) return `https://www.youtube.com/watch?v=${embed[1]}`
  const watch = html.match(/youtube\.com\/watch\?v=([^"&]+)/)
  if (watch) return `https://www.youtube.com/watch?v=${watch[1]}`
  return ''
}

function extractImageUrls(html) {
  const urls = new Set()
  const re = /https:\/\/[^"'\\s]+wp-content\/uploads\/[^"'\\s]+/g
  for (const m of html.matchAll(re)) {
    urls.add(m[0].split('?')[0])
  }
  return [...urls]
}

async function downloadFile(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download falhou: ${url} (${res.status})`)
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

function upsertCase(db, payload) {
  const now = new Date().toISOString()
  const existing = db.prepare('SELECT id FROM cases WHERE slug = ?').get(payload.slug)
  const caseId = existing?.id ?? randomUUID()

  db.prepare(
    `INSERT INTO cases (
      id, wp_id, slug, title, subtitle, cover_path, youtube_url,
      status, sort_order, wp_source_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      subtitle = excluded.subtitle,
      cover_path = excluded.cover_path,
      youtube_url = excluded.youtube_url,
      status = excluded.status,
      sort_order = excluded.sort_order,
      wp_source_url = excluded.wp_source_url,
      updated_at = excluded.updated_at`
  ).run(
    caseId,
    payload.wp_id,
    payload.slug,
    payload.title,
    payload.subtitle,
    payload.cover_path,
    payload.youtube_url,
    payload.status,
    payload.sort_order,
    payload.wp_source_url,
    now,
    now
  )

  db.prepare(
    `INSERT INTO case_content (case_id, body_html, imported_at)
     VALUES (?, ?, ?)
     ON CONFLICT(case_id) DO UPDATE SET
       body_html = excluded.body_html,
       imported_at = excluded.imported_at`
  ).run(caseId, payload.body_html, now)

  db.prepare('DELETE FROM case_media WHERE case_id = ?').run(caseId)
  const insertMedia = db.prepare(
    `INSERT INTO case_media (id, case_id, path, alt, caption, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
  for (const m of payload.media) {
    insertMedia.run(randomUUID(), caseId, m.path, m.alt, m.caption, m.sort_order)
  }

  return caseId
}

async function main() {
  const root = projectRoot()
  const fileEnv = { ...loadEnv(path.join(root, '.env')), ...loadEnv(path.join(root, '.env.local')) }

  const siteUrl = (process.env.WP_SITE_URL || fileEnv.WP_SITE_URL)?.replace(/\/$/, '')
  const passwords = collectPasswords(fileEnv)
  const password = passwords[0]
  const dbPath = resolveSiteDbPath(root, { ...fileEnv, ...process.env })
  const inventoryPath = path.join(root, 'data', 'wp-inventory.json')

  if (!siteUrl || !password) {
    console.error('Defina WP_SITE_URL e WP_SITE_PASSWORD (ou WP_POST_PASSWORD) no .env')
    process.exit(1)
  }

  if (!fs.existsSync(inventoryPath)) {
    console.error('Rode primeiro: node scripts/wp-inventory.mjs')
    process.exit(1)
  }

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))
  const siteHost = new URL(siteUrl).hostname

  console.log('Carregando grid /portfolio/ …')
  const portfolioHtml = await fetchUnlocked(siteUrl, password, '/portfolio/')
  const grid = parsePortfolioGrid(portfolioHtml, siteHost)

  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')

  const version = db.pragma('user_version', { simple: true })
  if (version < 3) {
    const mig = path.join(root, 'lib', 'db', 'migrations', '003_cases.sql')
    if (fs.existsSync(mig)) {
      db.exec(fs.readFileSync(mig, 'utf8'))
      db.pragma('user_version = 3')
    }
  }

  const mediaRoot = path.join(path.dirname(dbPath), 'media', 'cases')

  let imported = 0
  for (let i = 0; i < inventory.items.length; i++) {
    const item = inventory.items[i]
    const slug = item.slug
    console.log(`\n[${i + 1}/${inventory.items.length}] ${slug}`)

    const existing = db.prepare('SELECT id FROM cases WHERE slug = ?').get(slug)
    if (existing && !force) {
      console.log('  → já existe (use --force para reimportar)')
      continue
    }

    const gridInfo = grid.get(slug)
    const caseUrl = item.url
    const html = await fetchCaseHtml(caseUrl, passwords, siteUrl)
    const locked = isLockedHtml(html)

    let bodyHtml = extractEntryContent(html)
    if (locked && !bodyHtml) {
      console.log('  ⚠ conteúdo bloqueado — use export WXR: npm run wp:import:wxr')
    }

    const title = decodeHtml(item.title.replace(/^Protegido:\s*/i, ''))
    const subtitle = extractSubtitle(html)
    const youtubeUrl = extractYoutube(html)

    const caseMediaDir = path.join(mediaRoot, slug)
    let coverPath = ''

    if (gridInfo?.coverUrl) {
      const coverExt = extFromUrl(gridInfo.coverUrl)
      const coverFile = `cover${coverExt}`
      const coverDest = path.join(caseMediaDir, coverFile)
      try {
        await downloadFile(gridInfo.coverUrl, coverDest)
        coverPath = `/media/cases/${slug}/${coverFile}`
        console.log('  ✓ capa')
      } catch (e) {
        console.log('  ⚠ capa:', e.message)
      }
    }

    const imageUrls = extractImageUrls(bodyHtml)
    const urlToLocal = new Map()
    const mediaRows = []

    for (let j = 0; j < imageUrls.length; j++) {
      const imgUrl = imageUrls[j]
      const imgExt = extFromUrl(imgUrl)
      const filename = `img-${String(j + 1).padStart(2, '0')}${imgExt}`
      const dest = path.join(caseMediaDir, filename)
      try {
        await downloadFile(imgUrl, dest)
        const localPath = `/media/cases/${slug}/${filename}`
        urlToLocal.set(imgUrl, localPath)
        mediaRows.push({
          path: localPath,
          alt: '',
          caption: '',
          sort_order: j,
        })
      } catch {
        /* keep remote URL in HTML */
      }
    }

    for (const [remote, local] of urlToLocal) {
      bodyHtml = bodyHtml.split(remote).join(local)
      bodyHtml = bodyHtml.split(remote + '?w=1024').join(local)
    }

    upsertCase(db, {
      wp_id: `wp-${slug}`,
      slug,
      title,
      subtitle,
      cover_path: coverPath,
      youtube_url: youtubeUrl,
      body_html: bodyHtml,
      status: 'published',
      sort_order: i,
      wp_source_url: caseUrl,
      media: mediaRows,
    })

    console.log(
      `  ✓ importado (${bodyHtml.length} chars HTML, ${mediaRows.length} imagens${youtubeUrl ? ', YouTube' : ''})`
    )
    imported++
  }

  db.close()
  console.log(`\nConcluído: ${imported} case(s) importado(s).`)
  console.log('Veja / (grid) e /cases/[slug] (logado).')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
