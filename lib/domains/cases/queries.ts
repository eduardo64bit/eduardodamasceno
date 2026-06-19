import { getDb } from '@/lib/db/client'
import type { CaseFull, CasePublic } from './types'
import {
  mapCaseFull,
  mapCaseMedia,
  mapCasePublic,
  type CaseContentRow,
  type CaseMediaRow,
  type CaseRow,
} from './rows'

const publicFields = `
  id, slug, title, subtitle, cover_path, sort_order, status
`

export function getPublishedCasesPublic(): CasePublic[] {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT ${publicFields}
       FROM cases
       WHERE status = 'published'
       ORDER BY sort_order ASC, title ASC`
    )
    .all() as Pick<
    CaseRow,
    'id' | 'slug' | 'title' | 'subtitle' | 'cover_path' | 'sort_order' | 'status'
  >[]

  return rows.map((row) => mapCasePublic(row as CaseRow))
}

export function getAllCasesPublic(): CasePublic[] {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT ${publicFields}
       FROM cases
       ORDER BY sort_order ASC, title ASC`
    )
    .all() as Pick<
    CaseRow,
    'id' | 'slug' | 'title' | 'subtitle' | 'cover_path' | 'sort_order' | 'status'
  >[]

  return rows.map((row) => mapCasePublic(row as CaseRow))
}

/** Full case — call only from authenticated server routes. */
export function getCaseFullBySlug(slug: string): CaseFull | null {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM cases WHERE slug = ?')
    .get(slug) as CaseRow | undefined

  if (!row) return null

  const content = db
    .prepare('SELECT case_id, body_html, imported_at FROM case_content WHERE case_id = ?')
    .get(row.id) as CaseContentRow | undefined

  const media = db
    .prepare(
      `SELECT id, case_id, path, alt, caption, sort_order
       FROM case_media WHERE case_id = ? ORDER BY sort_order ASC`
    )
    .all(row.id) as CaseMediaRow[]

  return mapCaseFull(row, content ?? null, media)
}

export function getCasePublicBySlug(slug: string): CasePublic | null {
  const db = getDb()
  const row = db
    .prepare(`SELECT ${publicFields} FROM cases WHERE slug = ? AND status = 'published'`)
    .get(slug) as
    | Pick<
        CaseRow,
        'id' | 'slug' | 'title' | 'subtitle' | 'cover_path' | 'sort_order' | 'status'
      >
    | undefined

  if (!row) return null
  return mapCasePublic(row as CaseRow)
}
