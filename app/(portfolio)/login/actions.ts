'use server'

import { cookies } from 'next/headers'
import {
  getPortfolioSessionToken,
  PORTFOLIO_SESSION_COOKIE,
} from '@/lib/domains/auth/portfolio'

export interface PortfolioLoginState {
  error?: string
  redirectTo?: string
}

export async function portfolioLoginAction(
  _prev: PortfolioLoginState,
  formData: FormData
): Promise<PortfolioLoginState> {
  const password = formData.get('password') as string
  const from = (formData.get('from') as string) || '/'

  const expectedPassword = process.env.PORTFOLIO_PASSWORD ?? 'portfolio'

  if (password !== expectedPassword) {
    return { error: 'Senha incorreta. Tente novamente.' }
  }

  const token = getPortfolioSessionToken(password)

  const cookieStore = await cookies()
  cookieStore.set(PORTFOLIO_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  const redirectTo = from.startsWith('/') ? from : '/'
  return { redirectTo }
}
