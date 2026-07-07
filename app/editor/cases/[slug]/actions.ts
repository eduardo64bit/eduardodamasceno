'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createCase, updateCaseBySlug } from '@/lib/domains/cases/mutations'
import { isCaseSegmentId } from '@/lib/domains/cases/segments'
import type { CaseStatus, SaveCaseMediaItem, SaveCasePayload } from '@/lib/domains/cases/types'

export interface SaveCaseState {
  error?: string
}

function parseMediaJson(
  raw: FormDataEntryValue | null,
  slug: string
): SaveCaseMediaItem[] | { error: string } {
  if (!raw || typeof raw !== 'string' || !raw.trim()) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return { error: 'Galeria inválida.' }

    const prefix = `/media/cases/${slug}/`
    const items: SaveCaseMediaItem[] = []

    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i]
      if (!row || typeof row !== 'object') return { error: 'Galeria inválida.' }
      const record = row as Record<string, unknown>
      const path = String(record.path ?? '').trim()
      if (!path.startsWith(prefix)) return { error: 'Path de mídia inválido.' }
      items.push({
        path,
        alt: String(record.alt ?? '').trim(),
        caption: String(record.caption ?? '').trim(),
        sort_order: i,
      })
    }

    return items
  } catch {
    return { error: 'Galeria inválida.' }
  }
}

function parsePayload(formData: FormData, slug: string): SaveCasePayload | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  if (!title) return { error: 'Título é obrigatório.' }

  const status = String(formData.get('status') ?? 'draft')
  if (status !== 'draft' && status !== 'published') {
    return { error: 'Status inválido.' }
  }

  const sortRaw = Number(formData.get('sort_order'))
  const sort_order = Number.isFinite(sortRaw) ? Math.round(sortRaw) : 0

  const segments = formData
    .getAll('segments')
    .map((v) => String(v))
    .filter(isCaseSegmentId)

  const cover_path = String(formData.get('cover_path') ?? '').trim()
  const mediaParsed = parseMediaJson(formData.get('media_json'), slug)
  if ('error' in mediaParsed) return mediaParsed

  if (cover_path && !mediaParsed.some((m) => m.path === cover_path)) {
    return { error: 'A capa deve ser uma imagem da galeria.' }
  }

  return {
    title,
    subtitle: String(formData.get('subtitle') ?? '').trim(),
    cover_path: cover_path || mediaParsed[0]?.path || '',
    youtube_url: String(formData.get('youtube_url') ?? '').trim(),
    body_html: String(formData.get('body_html') ?? ''),
    status: status as CaseStatus,
    sort_order,
    segments,
    media: mediaParsed,
  }
}

export async function saveCaseAction(
  slug: string,
  _prev: SaveCaseState,
  formData: FormData
): Promise<SaveCaseState> {
  const parsed = parsePayload(formData, slug)
  if ('error' in parsed) return { error: parsed.error }

  if (slug === 'new') {
    let newSlug: string
    try {
      const requestedSlug = String(formData.get('slug') ?? '').trim()
      newSlug = createCase(requestedSlug || parsed.title, parsed)
      revalidateCasePaths(newSlug)
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Erro ao criar case.' }
    }
    redirect(`/editor/cases/${newSlug}`)
  }

  try {
    updateCaseBySlug(slug, parsed)
    revalidateCasePaths(slug)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao salvar case.' }
  }
}

function revalidateCasePaths(slug: string) {
  revalidatePath('/')
  revalidatePath(`/cases/${slug}`)
  revalidatePath('/editor/cases')
  revalidatePath(`/editor/cases/${slug}`)
}
