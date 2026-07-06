import { getActiveResume } from '@/lib/db'
import { getPublishedCasesPublic } from '@/lib/domains/cases/queries'
import { portfolioClients } from '@/lib/portfolio/clients'
import { portfolioAbout, portfolioHero, portfolioSpecialties } from '@/lib/portfolio/copy'
import { PortfolioHome } from '@/components/portfolio/PortfolioHome'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  const cases = getPublishedCasesPublic()

  let resume = null
  try {
    resume = getActiveResume()
  } catch {
    resume = null
  }

  const name = resume?.profile?.name ?? 'Eduardo Damasceno'

  return (
    <PortfolioHome
      name={name}
      role={portfolioHero.role}
      aboutHeading={portfolioAbout.heading}
      aboutIntro={portfolioAbout.intro}
      specialties={portfolioSpecialties}
      clients={portfolioClients}
      cases={cases}
    />
  )
}
