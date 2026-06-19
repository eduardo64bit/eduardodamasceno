import { notFound, redirect } from 'next/navigation'
import { getActiveResume } from '@/lib/db'
import { isPortfolioAuthenticated } from '@/lib/domains/auth/portfolio'
import { getCaseFullBySlug } from '@/lib/domains/cases/queries'
import { CaseDetailView } from '@/components/portfolio/CaseDetailView'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params

  if (!(await isPortfolioAuthenticated())) {
    redirect(`/login?from=${encodeURIComponent(`/cases/${slug}`)}`)
  }

  const data = getCaseFullBySlug(slug)
  if (!data || data.status !== 'published') notFound()

  let profile = null
  try {
    profile = getActiveResume()?.profile
  } catch {
    profile = null
  }

  return (
    <CaseDetailView
      data={data}
      contactName={profile?.name}
      contactEmail={profile?.email}
    />
  )
}
