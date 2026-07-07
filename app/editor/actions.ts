'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { EDITOR_SESSION_COOKIE } from '@/lib/domains/auth/editor'

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(EDITOR_SESSION_COOKIE)
  redirect('/editor/login')
}
