import type { Metadata } from 'next'
import { getActiveResume } from '@/lib/db'
import { getPublishedCasesPublic } from '@/lib/domains/cases/queries'
import { CasesIndexView } from '@/components/portfolio/CasesIndexView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projetos — Eduardo Damasceno',
  robots: { index: false, follow: false },
}

export default function CasesIndexPage() {
  const cases = getPublishedCasesPublic()

  let name = 'Eduardo Damasceno'
  try {
    name = getActiveResume()?.profile?.name ?? name
  } catch {
    name = 'Eduardo Damasceno'
  }

  return <CasesIndexView name={name} cases={cases} />
}
