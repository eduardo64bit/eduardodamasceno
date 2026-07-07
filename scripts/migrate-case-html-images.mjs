#!/usr/bin/env node
/**
 * Baixa imagens referenciadas no body_html de cada case, grava em data/media/,
 * preenche case_media e remove <img>/<figure> do HTML (novo modelo).
 *
 * Não reimporta cases do WordPress — só usa o HTML que já está no SQLite.
 *
 * Uso: node scripts/migrate-case-html-images.mjs [--dry-run] [--force]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import Database from 'better-sqlite3'
import { resolveSiteDbPath } from './lib/site-db-path.mjs'

const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i

function projectRoot() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(scriptDir, '..')
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

function publicPath(slug, filename) {
  return `/media/cases/${slug}/${filename}`
}

function normalizeImageKey(url) {
  try {
    return new URL(url, 'https://local').pathname.replace(/\/$/, '')
  } catch {
    return url.split('?')[0]
  }
}

function extFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname.split('?')[0]).toLowerCase()
    if (ext && ext.length <= 5 && IMAGE_EXT.test(ext)) return ext
  } catch {
    /* ignore */
  }
  return '.jpg'
}

function extractImagesFromHtml(html) {
  const seen = new Set()
  const slides = []

  const push = (src, alt = '', caption = '') => {
    const key = normalizeImageKey(src)
    if (!src || seen.has(key)) return
    seen.add(key)
    slides.push({ src, alt, caption })
  }

  const figureRe = /<figure[^>]*>([\s\S]*?)<\/figure>/gi
  let figureMatch
  while ((figureMatch = figureRe.exec(html)) !== null) {
    const block = figureMatch[0]
    const src = block.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
    if (!src) continue
    const alt = block.match(/<img[^>]+alt=["']([^"']*)["']/i)?.[1] ?? ''
    const caption =
      block
        .match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]
        ?.replace(/<[^>]+>/g, '')
        .trim() ?? ''
    push(src, alt, caption)
  }

  const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let imgMatch
  while ((imgMatch = imgRe.exec(html)) !== null) {
    const tag = imgMatch[0]
    const src = imgMatch[1]
    const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1] ?? ''
    push(src, alt, '')
  }

  return slides
}

function stripImagesFromHtml(html) {
  return html
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
    .replace(/<img[^>]*\/?>/gi, '')
    .replace(/<\/figure>/gi, '')
    .replace(/<p>\s*(?:<br\s*\/?>\s*)*<\/p>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function resolveLocalPath(mediaRoot, slug, src) {
  const prefix = `/media/cases/${slug}/`
  if (!src.startsWith(prefix)) return null
  const rel = src.slice(prefix.length)
  const resolved = path.resolve(path.join(mediaRoot, slug), rel)
  const base = path.resolve(path.join(mediaRoot, slug))
  if (!resolved.startsWith(base) || !fs.existsSync(resolved)) return null
  return src.split('?')[0]
}

async function downloadToCase(mediaDir, slug, url, index) {
  const ext = extFromUrl(url)
  let n = index + 1
  let filename = `img-${String(n).padStart(2, '0')}${ext}`
  while (fs.existsSync(path.join(mediaDir, filename))) {
    n += 1
    filename = `img-${String(n).padStart(2, '0')}${ext}`
  }
  const dest = path.join(mediaDir, filename)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const buffer = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buffer)

  return publicPath(slug, filename)
}

function replaceUrlInHtml(html, fromUrl, toPath) {
  const base = fromUrl.split('?')[0]
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return html.replace(new RegExp(escaped + '(\\?[^"\'\\s]*)?', 'g'), toPath)
}

async function main() {
  const root = projectRoot()
  const fileEnv = { ...loadEnv(path.join(root, '.env')), ...loadEnv(path.join(root, '.env.local')) }
  const dbPath = resolveSiteDbPath(root, { ...fileEnv, ...process.env })
  const mediaRoot = path.join(path.dirname(dbPath), 'media', 'cases')

  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')

  const cases = db
    .prepare(
      `SELECT c.id, c.slug, c.cover_path, COALESCE(cc.body_html, '') AS body_html
       FROM cases c
       LEFT JOIN case_content cc ON cc.case_id = c.id
       ORDER BY c.sort_order ASC, c.title ASC`
    )
    .all()

  let migrated = 0
  let skipped = 0

  for (const row of cases) {
    const htmlImages = extractImagesFromHtml(row.body_html)
    const hasRemote = htmlImages.some((img) => !img.src.startsWith('/media/'))

    const existing = db.prepare('SELECT COUNT(*) AS n FROM case_media WHERE case_id = ?').get(row.id)

    if (!force && existing.n > 1 && !hasRemote) {
      console.log(`⊘ ${row.slug} — já migrado (${existing.n} em case_media)`)
      skipped += 1
      continue
    }

    if (htmlImages.length === 0 && !row.cover_path) {
      console.log(`⊘ ${row.slug} — sem imagens no HTML`)
      skipped += 1
      continue
    }

    const mediaDir = path.join(mediaRoot, row.slug)
    if (!dryRun) fs.mkdirSync(mediaDir, { recursive: true })

    let bodyHtml = row.body_html
    const mediaItems = []
    const seenPaths = new Set()

    const addMedia = (mediaPath, alt, caption) => {
      if (!mediaPath || seenPaths.has(mediaPath)) return
      seenPaths.add(mediaPath)
      mediaItems.push({
        path: mediaPath,
        alt,
        caption,
        sort_order: mediaItems.length,
      })
    }

    if (row.cover_path?.startsWith(`/media/cases/${row.slug}/`)) {
      const local = resolveLocalPath(mediaRoot, row.slug, row.cover_path)
      if (local) addMedia(local, '', '')
    }

    let downloadIndex = 0
    for (const img of htmlImages) {
      let localPath = null

      if (img.src.startsWith('/media/')) {
        localPath = resolveLocalPath(mediaRoot, row.slug, img.src)
      } else {
        try {
          if (!dryRun) {
            localPath = await downloadToCase(mediaDir, row.slug, img.src, downloadIndex)
            downloadIndex += 1
            bodyHtml = replaceUrlInHtml(bodyHtml, img.src, localPath)
          } else {
            localPath = `[dry-run]/media/cases/${row.slug}/img-${String(downloadIndex + 1).padStart(2, '0')}.jpg`
            downloadIndex += 1
          }
        } catch (error) {
          console.log(
            `  ⚠ falha ao baixar ${img.src.slice(0, 60)}… — ${error instanceof Error ? error.message : error}`
          )
          continue
        }
      }

      if (localPath && !dryRun) {
        addMedia(localPath, img.alt, img.caption)
      } else if (localPath && dryRun) {
        addMedia(localPath, img.alt, img.caption)
      }
    }

    if (!dryRun) {
      bodyHtml = stripImagesFromHtml(bodyHtml)
    }

    const cover =
      row.cover_path && mediaItems.some((m) => m.path === row.cover_path)
        ? row.cover_path
        : mediaItems[0]?.path ?? row.cover_path

    console.log(
      `✓ ${row.slug} — ${mediaItems.length} imagem(ns) na galeria` +
        (hasRemote ? ' (baixadas do HTML)' : '') +
        (dryRun ? ' [dry-run]' : ', HTML sem <img>')
    )

    if (!dryRun) {
      const now = new Date().toISOString()
      const tx = db.transaction(() => {
        db.prepare('UPDATE cases SET cover_path = ?, updated_at = ? WHERE id = ?').run(
          cover ?? '',
          now,
          row.id
        )

        db.prepare(
          `INSERT INTO case_content (case_id, body_html, imported_at)
           VALUES (?, ?, NULL)
           ON CONFLICT(case_id) DO UPDATE SET body_html = excluded.body_html`
        ).run(row.id, bodyHtml)

        db.prepare('DELETE FROM case_media WHERE case_id = ?').run(row.id)
        const insert = db.prepare(
          `INSERT INTO case_media (id, case_id, path, alt, caption, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        for (const item of mediaItems) {
          insert.run(randomUUID(), row.id, item.path, item.alt, item.caption, item.sort_order)
        }
      })
      tx()
    }

    migrated += 1
  }

  db.close()

  console.log('')
  console.log(
    dryRun
      ? `Dry-run: ${migrated} case(s) seriam migrados, ${skipped} ignorados.`
      : `Pronto: ${migrated} case(s) migrados, ${skipped} ignorados.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
