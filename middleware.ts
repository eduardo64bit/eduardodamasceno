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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Login page is public
  if (pathname === '/cvmkr/login') {
    return NextResponse.next()
  }

  const password = process.env.CVMKR_PASSWORD ?? 'admin'
  const secret = process.env.CVMKR_SECRET ?? 'cvmkr-secret'
  const expectedToken = await computeToken(password, secret)

  const sessionToken = request.cookies.get('cvmkr_session')?.value

  if (sessionToken !== expectedToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/cvmkr/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/cvmkr/:path*',
}
