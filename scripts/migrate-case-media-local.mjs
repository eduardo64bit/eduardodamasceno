#!/usr/bin/env node
/**
 * Promove mídia local existente (disco + paths /media/ no HTML) para case_media.
 * Não baixa nada do WordPress.
 *
 * Uso: node scripts/migrate-case-media-local.mjs [--dry-run]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import Database from 'better-sqlite3'
import { resolveSiteDbPath } from './lib/site-db-path.mjs'

const dryRun = process.argv.includes('--dry-run')
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

function listDiskPaths(slug, mediaRoot) {
  const dir = path.join(mediaRoot, slug)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXT.test(name))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((name) => publicPath(slug, name))
}

function extractLocalHtmlPaths(html, slug) {
  const prefix = `/media/cases/${slug}/`
  const paths = new Set()
  const re = /src=["'](\/media\/cases\/[^"']+)["']/gi
  for (const match of html.matchAll(re)) {
    const src = match[1].split('?')[0]
    if (src.startsWith(prefix)) paths.add(src)
  }
  return [...paths]
}

function buildMediaRows(slug, coverPath, diskPaths, htmlPaths) {
  const ordered = []
  const seen = new Set()

  const push = (mediaPath) => {
    if (!mediaPath.startsWith(`/media/cases/${slug}/`) || seen.has(mediaPath)) return
    seen.add(mediaPath)
    ordered.push(mediaPath)
  }

  if (coverPath) push(coverPath)
  for (const p of diskPaths) push(p)
  for (const p of htmlPaths) push(p)

  return ordered.map((mediaPath, sort_order) => ({
    path: mediaPath,
    alt: '',
    caption: '',
    sort_order,
  }))
}

function main() {
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
    const existing = db
      .prepare('SELECT COUNT(*) AS n FROM case_media WHERE case_id = ?')
      .get(row.id)

    if (existing.n > 0) {
      console.log(`⊘ ${row.slug} — case_media já preenchido (${existing.n})`)
      skipped += 1
      continue
    }

    const diskPaths = listDiskPaths(row.slug, mediaRoot)
    const htmlPaths = extractLocalHtmlPaths(row.body_html, row.slug)
    const media = buildMediaRows(row.slug, row.cover_path, diskPaths, htmlPaths)

    if (media.length === 0) {
      console.log(`⊘ ${row.slug} — nenhuma imagem local`)
      skipped += 1
      continue
    }

    const cover = row.cover_path && media.some((m) => m.path === row.cover_path)
      ? row.cover_path
      : media[0].path

    console.log(`✓ ${row.slug} — ${media.length} imagem(ns), capa: ${path.basename(cover)}`)

    if (!dryRun) {
      const tx = db.transaction(() => {
        if (cover !== row.cover_path) {
          db.prepare('UPDATE cases SET cover_path = ?, updated_at = ? WHERE id = ?').run(
            cover,
            new Date().toISOString(),
            row.id
          )
        }

        const insert = db.prepare(
          `INSERT INTO case_media (id, case_id, path, alt, caption, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        for (const item of media) {
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

main()
