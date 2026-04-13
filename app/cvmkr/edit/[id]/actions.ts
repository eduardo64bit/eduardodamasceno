'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { SaveResumePayload } from '@/lib/types'

export async function saveResume(id: string, payload: SaveResumePayload) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  if (id === 'new') {
    // ── Create new resume ────────────────────────────────────────────────
    const { data: newResume, error } = await supabase
      .from('resumes')
      .insert({
        name: payload.resumeInfo.name || 'Novo currículo',
        description: payload.resumeInfo.description || null,
        is_base: false,
        is_active: false,
      })
      .select()
      .single()

    if (error || !newResume) throw new Error('Erro ao criar currículo.')

    const newId: string = newResume.id
    await upsertRelations(supabase, newId, payload)

    revalidatePath('/cvmkr/dashboard')
    redirect(`/cvmkr/edit/${newId}`)
  } else {
    // ── Update existing resume ───────────────────────────────────────────
    await supabase
      .from('resumes')
      .update({
        name: payload.resumeInfo.name,
        description: payload.resumeInfo.description || null,
        updated_at: now,
      })
      .eq('id', id)

    await upsertRelations(supabase, id, payload)

    revalidatePath('/cvmkr/dashboard')
    revalidatePath(`/cvmkr/edit/${id}`)
    revalidatePath('/')
  }
}

// ─── Internal ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertRelations(supabase: any, resumeId: string, payload: SaveResumePayload) {
  // Profile — upsert by resume_id (unique column)
  await supabase.from('profile').upsert(
    { ...payload.profile, resume_id: resumeId },
    { onConflict: 'resume_id' }
  )

  // Experiences — delete + re-insert (simplest approach for reordering)
  await supabase.from('experiences').delete().eq('resume_id', resumeId)
  if (payload.experiences.length > 0) {
    await supabase.from('experiences').insert(
      payload.experiences.map((e, i) => ({
        ...e,
        resume_id: resumeId,
        order_index: i,
      }))
    )
  }

  // Skills — delete + re-insert
  await supabase.from('skills').delete().eq('resume_id', resumeId)
  if (payload.skills.length > 0) {
    await supabase.from('skills').insert(
      payload.skills.map((s) => ({ ...s, resume_id: resumeId }))
    )
  }

  // Education — delete + re-insert
  await supabase.from('education').delete().eq('resume_id', resumeId)
  if (payload.education.length > 0) {
    await supabase.from('education').insert(
      payload.education.map((e, i) => ({
        ...e,
        resume_id: resumeId,
        order_index: i,
      }))
    )
  }
}
