'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createCase, updateCaseBySlug } from '@/lib/domains/cases/mutations'
import { isCaseSegmentId } from '@/lib/domains/cases/segments'
import type { CaseStatus, SaveCasePayload } from '@/lib/domains/cases/types'

export interface SaveCaseState {
  error?: string
}

function parsePayload(formData: FormData): SaveCasePayload | { error: string } {
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

  return {
    title,
    subtitle: String(formData.get('subtitle') ?? '').trim(),
    cover_path: String(formData.get('cover_path') ?? '').trim(),
    youtube_url: String(formData.get('youtube_url') ?? '').trim(),
    body_html: String(formData.get('body_html') ?? ''),
    status: status as CaseStatus,
    sort_order,
    segments,
  }
}

export async function saveCaseAction(
  slug: string,
  _prev: SaveCaseState,
  formData: FormData
): Promise<SaveCaseState> {
  const parsed = parsePayload(formData)
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
  revalidatePath('/cases')
  revalidatePath(`/cases/${slug}`)
  revalidatePath('/editor/cases')
  revalidatePath(`/editor/cases/${slug}`)
}
