import { extractImagesFromHtml } from '@/lib/portfolio/case-content'
import type { CaseFull, CaseMedia } from './types'

export interface CaseMediaDraft {
  path: string
  alt: string
  caption: string
  sort_order: number
}

function isLocalCaseMediaPath(mediaPath: string, slug: string): boolean {
  return mediaPath.startsWith(`/media/cases/${slug}/`)
}

function mediaDraftFromPath(
  mediaPath: string,
  sortOrder: number,
  alt = '',
  caption = ''
): CaseMediaDraft {
  return { path: mediaPath, alt, caption, sort_order: sortOrder }
}

/** Galeria editável — DB, capa, HTML local e paths extras (disco, só no servidor). */
export function deriveEditorMedia(
  caseData: CaseFull,
  diskPaths: string[] = []
): CaseMediaDraft[] {
  if (caseData.media.length > 0) {
    return caseData.media.map((m, index) => ({
      path: m.path,
      alt: m.alt,
      caption: m.caption,
      sort_order: index,
    }))
  }

  const items: CaseMediaDraft[] = []
  const seen = new Set<string>()

  const push = (draft: CaseMediaDraft) => {
    if (!isLocalCaseMediaPath(draft.path, caseData.slug) || seen.has(draft.path)) return
    seen.add(draft.path)
    items.push({ ...draft, sort_order: items.length })
  }

  if (caseData.cover_path && isLocalCaseMediaPath(caseData.cover_path, caseData.slug)) {
    push(mediaDraftFromPath(caseData.cover_path, 0))
  }

  for (const slide of extractImagesFromHtml(caseData.body_html)) {
    if (!isLocalCaseMediaPath(slide.src, caseData.slug)) continue
    push(mediaDraftFromPath(slide.src, items.length, slide.alt, slide.caption))
  }

  for (const diskPath of diskPaths) {
    push(mediaDraftFromPath(diskPath, items.length))
  }

  return items
}

export function deriveEditorCoverPath(caseData: CaseFull, media: CaseMediaDraft[]): string {
  if (caseData.cover_path && media.some((m) => m.path === caseData.cover_path)) {
    return caseData.cover_path
  }
  return media[0]?.path ?? caseData.cover_path ?? ''
}

export function listLegacyRemoteImages(
  caseData: CaseFull,
  diskPaths: string[] = []
): Array<{ src: string; alt: string }> {
  const localPaths = new Set(deriveEditorMedia(caseData, diskPaths).map((m) => m.path))

  return extractImagesFromHtml(caseData.body_html)
    .filter((slide) => !slide.src.startsWith('/media/') && !localPaths.has(slide.src))
    .map((slide) => ({ src: slide.src, alt: slide.alt }))
}

export function toMediaDrafts(media: CaseMedia[]): CaseMediaDraft[] {
  return media.map((m, index) => ({
    path: m.path,
    alt: m.alt,
    caption: m.caption,
    sort_order: index,
  }))
}
