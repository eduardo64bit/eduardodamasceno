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
  cookieNames: string[]
  loginPath: string
}

async function requireAuth(request: NextRequest, gate: AuthGate): Promise<NextResponse> {
  const expectedToken = await computeToken(gate.password, gate.secret)
  const sessionToken = gate.cookieNames
    .map((name) => request.cookies.get(name)?.value)
    .find(Boolean)
  if (sessionToken === expectedToken) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = gate.loginPath
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

/** Editor auth — redirect (páginas) ou 401 JSON (API). Retorna null se autenticado. */
async function denyUnlessEditor(request: NextRequest): Promise<NextResponse | null> {
  const password = process.env.EDITOR_PASSWORD ?? 'admin'
  const secret = process.env.EDITOR_SECRET ?? 'editor-secret'
  const expectedToken = await computeToken(password, secret)
  const sessionToken = request.cookies.get('editor_session')?.value
  if (sessionToken === expectedToken) return null

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl.clone()
  url.pathname = '/editor/login'
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

  // Legado: /cases → /portfolio, preservando slug e query string.
  if (pathname === '/cases' || pathname.startsWith('/cases/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/cases/, '/portfolio')
    return NextResponse.redirect(url, 308)
  }

  if (pathname.startsWith('/editor')) {
    if (pathname === '/editor/login') {
      return NextResponse.next()
    }

    const denied = await denyUnlessEditor(request)
    return denied ?? NextResponse.next()
  }

  if (pathname === '/status' || pathname === '/api/status') {
    const denied = await denyUnlessEditor(request)
    return denied ?? NextResponse.next()
  }

  if (
    pathname.startsWith('/portfolio') ||
    pathname === '/case' ||
    pathname.startsWith('/case/') ||
    pathname === '/cv' ||
    pathname.startsWith('/cv/')
  ) {
    return requireAuth(request, {
      password: process.env.PORTFOLIO_PASSWORD ?? 'portfolio',
      secret: process.env.PORTFOLIO_SECRET ?? 'portfolio-secret',
      cookieNames: ['portfolio_session'],
      loginPath: '/login',
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/homolog/:path*',
    '/editor',
    '/editor/:path*',
    '/cases',
    '/cases/:path*',
    '/portfolio',
    '/portfolio/:path*',
    '/case',
    '/case/:path*',
    '/cv',
    '/cv/:path*',
    '/status',
    '/api/status',
  ],
}
