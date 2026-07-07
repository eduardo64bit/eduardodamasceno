'use server'

import { revalidatePath } from 'next/cache'
import {
  deleteResume as deleteResumeDb,
  duplicateResume as duplicateResumeDb,
  setActiveResume as setActiveResumeDb,
} from '@/lib/db'

export async function setActiveResume(id: string) {
  setActiveResumeDb(id)
  revalidatePath('/editor/cv')
  revalidatePath('/editor')
  revalidatePath('/')
}

export async function deleteResume(id: string) {
  deleteResumeDb(id)
  revalidatePath('/editor/cv')
  revalidatePath('/editor')
  revalidatePath('/')
}

export async function duplicateResume(id: string, newName: string) {
  const newId = duplicateResumeDb(id, newName)
  revalidatePath('/editor/cv')
  revalidatePath('/editor')
  return newId
}
