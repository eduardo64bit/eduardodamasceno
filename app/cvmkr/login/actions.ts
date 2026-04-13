'use server'

import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface LoginState {
  error?: string
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

  const secret = process.env.CVMKR_SECRET ?? 'cvmkr-secret'
  const token = createHmac('sha256', secret).update(password).digest('hex')

  const cookieStore = await cookies()
  cookieStore.set('cvmkr_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  redirect(from.startsWith('/') ? from : '/cvmkr/dashboard')
}
