import { cookies } from 'next/headers'
import { createSessionToken } from './token'

export const PORTFOLIO_SESSION_COOKIE = 'portfolio_session'

function portfolioSecret(): string {
  return process.env.PORTFOLIO_SECRET ?? 'portfolio-secret'
}

function portfolioPassword(): string {
  return process.env.PORTFOLIO_PASSWORD ?? 'portfolio'
}

export function getPortfolioSessionToken(password = portfolioPassword()): string {
  return createSessionToken(password, portfolioSecret())
}

export async function isPortfolioAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(PORTFOLIO_SESSION_COOKIE)?.value
  if (!sessionToken) return false
  return sessionToken === getPortfolioSessionToken()
}
