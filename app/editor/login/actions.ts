'use server'

import { cookies } from 'next/headers'
import {
  EDITOR_SESSION_COOKIE,
  getEditorSessionToken,
  editorPassword,
} from '@/lib/domains/auth/editor'

export interface LoginState {
  error?: string
  redirectTo?: string
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password') as string
  const from = (formData.get('from') as string) || '/editor'

  if (password !== editorPassword()) {
    return { error: 'Senha incorreta. Tente novamente.' }
  }

  const token = getEditorSessionToken(password)

  const cookieStore = await cookies()
  cookieStore.set(EDITOR_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  const redirectTo = from.startsWith('/') ? from : '/editor'
  return { redirectTo }
}
