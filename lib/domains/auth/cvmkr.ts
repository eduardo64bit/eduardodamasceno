import { cookies } from 'next/headers'
import { createSessionToken } from './token'

export const CVMKR_SESSION_COOKIE = 'cvmkr_session'

function cvmkrSecret(): string {
  return process.env.CVMKR_SECRET ?? 'cvmkr-secret'
}

function cvmkrPassword(): string {
  return process.env.CVMKR_PASSWORD ?? 'admin'
}

export function getCvmkrSessionToken(password = cvmkrPassword()): string {
  return createSessionToken(password, cvmkrSecret())
}

export async function isCvmkrAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(CVMKR_SESSION_COOKIE)?.value
  if (!sessionToken) return false
  return sessionToken === getCvmkrSessionToken()
}
