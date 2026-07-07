'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createResume, updateResume } from '@/lib/db'
import type { SaveResumePayload } from '@/lib/types'

export async function saveResume(id: string, payload: SaveResumePayload) {
  if (id === 'new') {
    const newId = createResume(payload)
    revalidatePath('/editor/cv')
    revalidatePath('/editor')
    redirect(`/editor/cv/${newId}`)
  }

  updateResume(id, payload)
  revalidatePath('/editor/cv')
  revalidatePath('/editor')
  revalidatePath(`/editor/cv/${id}`)
  revalidatePath('/cv')
}
