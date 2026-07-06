import type { CaseFull, CaseMedia, CasePublic, CaseStatus } from './types'
import { parseCaseSegments } from './segments'

type CaseRow = {
  id: string
  wp_id: string | null
  slug: string
  title: string
  subtitle: string
  cover_path: string
  youtube_url: string
  status: string
  sort_order: number
  wp_source_url: string
  segments: string
  created_at: string
  updated_at: string
}

type CaseContentRow = {
  case_id: string
  body_html: string
  imported_at: string | null
}

type CaseMediaRow = Omit<CaseMedia, never>

export function mapCasePublic(row: CaseRow): CasePublic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    cover_path: row.cover_path,
    sort_order: row.sort_order,
    status: row.status as CaseStatus,
    segments: parseCaseSegments(row.segments),
  }
}

export function mapCaseMedia(row: CaseMediaRow): CaseMedia {
  return row
}

export function mapCaseFull(
  row: CaseRow,
  content: CaseContentRow | null,
  media: CaseMediaRow[]
): CaseFull {
  return {
    ...mapCasePublic(row),
    youtube_url: row.youtube_url,
    wp_id: row.wp_id,
    wp_source_url: row.wp_source_url,
    body_html: content?.body_html ?? '',
    media: media.map(mapCaseMedia),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export type { CaseRow, CaseContentRow, CaseMediaRow }
