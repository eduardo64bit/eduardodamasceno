import type { Metadata } from 'next'
import { StatusPage } from '@/components/portfolio/StatusPage'
import { collectSiteStatus } from '@/lib/domains/status/collector'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Status — Eduardo Damasceno',
  description: 'Painel operacional do site.',
  robots: { index: false, follow: false },
}

export default async function StatusRoute() {
  const status = await collectSiteStatus()
  return <StatusPage status={status} />
}
