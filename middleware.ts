import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** HMAC-SHA256 with Web Crypto API (Edge Runtime compatible) */
async function computeToken(password: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(password))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

interface AuthGate {
  password: string
  secret: string
  cookieName: string
  loginPath: string
}

async function requireAuth(request: NextRequest, gate: AuthGate): Promise<NextResponse> {
  const expectedToken = await computeToken(gate.password, gate.secret)
  const sessionToken = request.cookies.get(gate.cookieName)?.value
  if (sessionToken === expectedToken) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = gate.loginPath
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Cutover: /homolog → rotas definitivas
  if (pathname === '/homolog' || pathname.startsWith('/homolog/')) {
    const dest = pathname.replace(/^\/homolog/, '') || '/'
    return NextResponse.redirect(new URL(dest, request.url), 308)
  }

  if (pathname.startsWith('/cvmkr')) {
    if (pathname === '/cvmkr/login') {
      return NextResponse.next()
    }

    return requireAuth(request, {
      password: process.env.CVMKR_PASSWORD ?? 'admin',
      secret: process.env.CVMKR_SECRET ?? 'cvmkr-secret',
      cookieName: 'cvmkr_session',
      loginPath: '/cvmkr/login',
    })
  }

  if (pathname.startsWith('/cases')) {
    return requireAuth(request, {
      password: process.env.PORTFOLIO_PASSWORD ?? 'portfolio',
      secret: process.env.PORTFOLIO_SECRET ?? 'portfolio-secret',
      cookieName: 'portfolio_session',
      loginPath: '/login',
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/homolog/:path*', '/cvmkr/:path*', '/cases/:path*'],
}
