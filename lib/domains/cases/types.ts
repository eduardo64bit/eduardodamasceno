import type { CaseSegmentId } from './segments'

export type CaseStatus = 'draft' | 'published'

/** Public grid — no body, no gallery paths. */
export interface CasePublic {
  id: string
  slug: string
  title: string
  subtitle: string
  cover_path: string
  sort_order: number
  status: CaseStatus
  segments: CaseSegmentId[]
}

export interface CaseMedia {
  id: string
  case_id: string
  path: string
  alt: string
  caption: string
  sort_order: number
}

export interface CaseFull extends CasePublic {
  youtube_url: string
  wp_id: string | null
  wp_source_url: string
  body_html: string
  media: CaseMedia[]
  created_at: string
  updated_at: string
}

export interface SaveCasePayload {
  title: string
  subtitle: string
  cover_path: string
  youtube_url: string
  body_html: string
  status: CaseStatus
  sort_order: number
  wp_id?: string | null
  wp_source_url?: string
}
