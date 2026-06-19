import { randomUUID } from 'crypto'
import { getDb } from '@/lib/db/client'
import type { CaseStatus } from './types'

export interface ImportCasePayload {
  slug: string
  wp_id?: string | null
  title: string
  subtitle: string
  cover_path: string
  youtube_url: string
  body_html: string
  status: CaseStatus
  sort_order: number
  wp_source_url: string
  media: Array<{
    path: string
    alt: string
    caption: string
    sort_order: number
  }>
}

export function upsertImportedCase(payload: ImportCasePayload): string {
  const db = getDb()
  const now = new Date().toISOString()

  const existing = db
    .prepare('SELECT id FROM cases WHERE slug = ?')
    .get(payload.slug) as { id: string } | undefined

  const caseId = existing?.id ?? randomUUID()

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO cases (
        id, wp_id, slug, title, subtitle, cover_path, youtube_url,
        status, sort_order, wp_source_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        wp_id = excluded.wp_id,
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
      payload.wp_id ?? null,
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
      insertMedia.run(
        randomUUID(),
        caseId,
        m.path,
        m.alt,
        m.caption,
        m.sort_order
      )
    }
  })

  tx()
  return caseId
}
