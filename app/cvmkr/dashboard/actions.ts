'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { CVMKR_SESSION_COOKIE } from '@/lib/domains/auth/cvmkr'
import {
  deleteResume as deleteResumeDb,
  duplicateResume as duplicateResumeDb,
  setActiveResume as setActiveResumeDb,
} from '@/lib/db'

export async function setActiveResume(id: string) {
  setActiveResumeDb(id)
  revalidatePath('/cvmkr/dashboard')
  revalidatePath('/')
}

export async function deleteResume(id: string) {
  deleteResumeDb(id)
  revalidatePath('/cvmkr/dashboard')
  revalidatePath('/')
}

export async function duplicateResume(id: string, newName: string) {
  const newId = duplicateResumeDb(id, newName)
  revalidatePath('/cvmkr/dashboard')
  return newId
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(CVMKR_SESSION_COOKIE)
  redirect('/cvmkr/login')
}
