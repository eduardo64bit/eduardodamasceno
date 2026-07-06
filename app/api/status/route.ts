import { NextResponse } from 'next/server'
import { collectSiteStatus } from '@/lib/domains/status/collector'

export const dynamic = 'force-dynamic'

export async function GET() {
  const status = await collectSiteStatus()
  return NextResponse.json(status, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
