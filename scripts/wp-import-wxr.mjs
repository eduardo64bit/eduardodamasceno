#!/usr/bin/env node
/**
 * Importa cases de export WordPress (WXR/XML) → SQLite + data/media/
 * Exporte em: WP Admin → Ferramentas → Exportar → Portfolio (ou Todo conteúdo)
 * Salve como: data/wordpress-export.xml
 * Uso: node scripts/wp-import-wxr.mjs [--force] [caminho.xml]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import Database from 'better-sqlite3'
import { resolveSiteDbPath } from './lib/site-db-path.mjs'

const force = process.argv.includes('--force')
const xmlArg = process.argv.find((a) => a.endsWith('.xml'))

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
    .trim()
}

function extFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname.split('?')[0])
    if (ext && ext.length <= 5) return ext
  } catch {
    /* ignore */
  }
  return '.jpg'
}

function tagValue(block, tag) {
  const cdata = block.match(
    new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)
  )
  if (cdata) return cdata[1]
  const plain = block.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`))
  return plain?.[1] ?? ''
}

function parseWxrItems(xml) {
  const items = []
  for (const block of xml.split('<item>').slice(1)) {
    const chunk = block.split('</item>')[0]
    const postType = tagValue(chunk, 'wp:post_type')
    if (postType !== 'jetpack-portfolio') continue
    if (tagValue(chunk, 'wp:status') !== 'publish') continue

    const slug = tagValue(chunk, 'wp:post_name')
    if (!slug) continue

    items.push({
      wp_id: tagValue(chunk, 'wp:post_id') || `wp-${slug}`,
      slug,
      title: decodeHtml(tagValue(chunk, 'title').replace(/<[^>]+>/g, '')),
      link: tagValue(chunk, 'link'),
      body_html: tagValue(chunk, 'content:encoded'),
      excerpt: tagValue(chunk, 'excerpt:encoded'),
    })
  }
  return items
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
  const existing = db.prepare('SELECT id, cover_path FROM cases WHERE slug = ?').get(payload.slug)
  const caseId = existing?.id ?? randomUUID()
  const coverPath = payload.cover_path || existing?.cover_path || ''

  db.prepare(
    `INSERT INTO cases (
      id, wp_id, slug, title, subtitle, cover_path, youtube_url,
      status, sort_order, wp_source_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      subtitle = excluded.subtitle,
      cover_path = CASE WHEN excluded.cover_path != '' THEN excluded.cover_path ELSE cases.cover_path END,
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
    coverPath,
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
  const dbPath = resolveSiteDbPath(root, { ...fileEnv, ...process.env })
  const xmlPath = xmlArg ?? path.join(root, 'data', 'wordpress-export.xml')

  if (!fs.existsSync(xmlPath)) {
    console.error(`Arquivo não encontrado: ${xmlPath}`)
    console.error('Exporte no WordPress: Ferramentas → Exportar → salve como data/wordpress-export.xml')
    process.exit(1)
  }

  console.log(`Lendo ${xmlPath} …`)
  const xml = fs.readFileSync(xmlPath, 'utf8')
  const items = parseWxrItems(xml)
  console.log(`Encontrados ${items.length} portfolio item(s) no XML.`)

  if (!items.length) {
    console.error('Nenhum jetpack-portfolio no export. Tente exportar "Todo conteúdo".')
    process.exit(1)
  }

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

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    console.log(`\n[${i + 1}/${items.length}] ${item.slug}`)

    const existing = db.prepare('SELECT id FROM cases WHERE slug = ?').get(item.slug)
    if (existing && !force) {
      console.log('  → já existe (use --force para reimportar)')
      continue
    }

    let bodyHtml = item.body_html
    const youtubeUrl = extractYoutube(bodyHtml)
    const caseMediaDir = path.join(mediaRoot, item.slug)
    const imageUrls = extractImageUrls(bodyHtml)
    const urlToLocal = new Map()
    const mediaRows = []
    let coverPath = ''

    for (let j = 0; j < imageUrls.length; j++) {
      const imgUrl = imageUrls[j]
      const imgExt = extFromUrl(imgUrl)
      const filename = j === 0 ? `cover${imgExt}` : `img-${String(j).padStart(2, '0')}${imgExt}`
      const dest = path.join(caseMediaDir, filename)
      try {
        await downloadFile(imgUrl, dest)
        const localPath = `/media/cases/${item.slug}/${filename}`
        urlToLocal.set(imgUrl, localPath)
        if (j === 0) coverPath = localPath
        if (j > 0) {
          mediaRows.push({ path: localPath, alt: '', caption: '', sort_order: j - 1 })
        }
      } catch (e) {
        console.log(`  ⚠ imagem ${j + 1}:`, e.message)
      }
    }

    for (const [remote, local] of urlToLocal) {
      bodyHtml = bodyHtml.split(remote).join(local)
    }

    upsertCase(db, {
      wp_id: item.wp_id,
      slug: item.slug,
      title: item.title,
      subtitle: decodeHtml(item.excerpt.replace(/<[^>]+>/g, '')),
      cover_path: coverPath,
      youtube_url: youtubeUrl,
      body_html: bodyHtml,
      status: 'published',
      sort_order: i,
      wp_source_url: item.link,
      media: mediaRows,
    })

    console.log(
      `  ✓ importado (${bodyHtml.length} chars HTML, ${mediaRows.length} imagens${youtubeUrl ? ', YouTube' : ''})`
    )
    imported++
  }

  db.close()
  console.log(`\nConcluído: ${imported} case(s) importado(s) via WXR.`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
