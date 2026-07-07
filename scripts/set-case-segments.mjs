#!/usr/bin/env node
/**
 * Aplica segmentos nos cases (filtro da home).
 * Uso: node scripts/set-case-segments.mjs
 * Docker: docker compose exec web node scripts/set-case-segments.mjs
 */
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { resolveSiteDbPath } from './lib/site-db-path.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnv(file) {
  if (!fs.existsSync(file)) return {}
  const out = {}
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    out[m[1]] = v
  }
  return out
}

const env = { ...loadEnv(path.join(root, '.env')), ...loadEnv(path.join(root, '.env.local')) }
const dbPath = resolveSiteDbPath(root, { ...env, ...process.env })

/** slug → segment ids */
const CASE_SEGMENTS = {
  'fundacao-da-experiencia-pj-identidade-digital-e-governanca-de-acesso': ['financeiros'],
  'projeto-onboarding-de-parceiros-comerciais': ['financeiros'],
  'fee-based-plataforma-de-contratacao-e-gestao': ['financeiros'],
  'gestao-de-grupos-e-hierarquia-no-crm': ['financeiros'],
  'sistema-de-pagamentos-digitais-corporativos': ['financeiros'],
  'dirhect-plataforma-de-automacao-para-experiencias-de-rh': ['plataformas'],
  'bipdoc-app-de-lembretes-de-medicamentos': ['autorais'],
  'projeto-balanca-prix-6-touch': ['industria'],
  'terminal-de-pesagem-industrial-ti-500': ['industria'],
}

const db = new Database(dbPath)
const cols = db.prepare('PRAGMA table_info(cases)').all()
if (!cols.some((c) => c.name === 'segments')) {
  db.exec("ALTER TABLE cases ADD COLUMN segments TEXT NOT NULL DEFAULT '[]'")
  console.log('Coluna segments criada.')
}

const update = db.prepare('UPDATE cases SET segments = ? WHERE slug = ?')
const tx = db.transaction(() => {
  for (const [slug, segments] of Object.entries(CASE_SEGMENTS)) {
    const result = update.run(JSON.stringify(segments), slug)
    if (result.changes === 0) console.warn(`Slug não encontrado: ${slug}`)
  }
})
tx()

const rows = db
  .prepare('SELECT title, segments FROM cases ORDER BY sort_order ASC, title ASC')
  .all()
console.log(`\n${rows.length} cases em ${dbPath}:\n`)
for (const row of rows) {
  console.log(`  ${row.segments.padEnd(18)} ${row.title}`)
}
db.close()
