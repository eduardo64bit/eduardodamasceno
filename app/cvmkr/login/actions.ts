'use server'

import { cookies } from 'next/headers'
import {
  CVMKR_SESSION_COOKIE,
  getCvmkrSessionToken,
} from '@/lib/domains/auth/cvmkr'

export interface LoginState {
  error?: string
  redirectTo?: string
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password') as string
  const from = (formData.get('from') as string) || '/cvmkr/dashboard'

  const expectedPassword = process.env.CVMKR_PASSWORD ?? 'admin'

  if (password !== expectedPassword) {
    return { error: 'Senha incorreta. Tente novamente.' }
  }

  const token = getCvmkrSessionToken(password)

  const cookieStore = await cookies()
  cookieStore.set(CVMKR_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  const redirectTo = from.startsWith('/') ? from : '/cvmkr/dashboard'
  return { redirectTo }
}
