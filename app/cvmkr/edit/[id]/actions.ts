'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createResume, updateResume } from '@/lib/db'
import type { SaveResumePayload } from '@/lib/types'

export async function saveResume(id: string, payload: SaveResumePayload) {
  if (id === 'new') {
    const newId = createResume(payload)
    revalidatePath('/cvmkr/dashboard')
    redirect(`/cvmkr/edit/${newId}`)
  }

  updateResume(id, payload)
  revalidatePath('/cvmkr/dashboard')
  revalidatePath(`/cvmkr/edit/${id}`)
  revalidatePath('/cv')
}
