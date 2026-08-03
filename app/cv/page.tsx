import { redirect } from 'next/navigation'
import { CVPageContent } from '@/components/cv/CVPageContent'
import { isPortfolioAuthenticated } from '@/lib/domains/auth/portfolio'

export const dynamic = 'force-dynamic'

export default async function CVPage() {
  if (!(await isPortfolioAuthenticated())) {
    redirect(`/login?from=${encodeURIComponent('/cv')}`)
  }

  return <CVPageContent />
}
