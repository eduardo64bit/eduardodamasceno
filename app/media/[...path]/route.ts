import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const MEDIA_ROOT = path.join(
  process.env.CVMKR_DB_PATH
    ? path.dirname(process.env.CVMKR_DB_PATH)
    : path.join(process.cwd(), 'data'),
  'media'
)

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path
  if (!segments?.length || segments.some((s) => s === '..' || s === '.')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const filePath = path.join(MEDIA_ROOT, ...segments)
  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(path.resolve(MEDIA_ROOT))) {
    return new NextResponse('Not found', { status: 404 })
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = path.extname(resolved).toLowerCase()
  const body = fs.readFileSync(resolved)

  return new NextResponse(body, {
    headers: {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
