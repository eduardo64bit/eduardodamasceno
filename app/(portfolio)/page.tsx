import { getActiveResume } from '@/lib/db'
import { getPublishedCasesPublic } from '@/lib/domains/cases/queries'
import { portfolioClients } from '@/lib/portfolio/clients'
import { portfolioAbout } from '@/lib/portfolio/copy'
import { PortfolioHome } from '@/components/portfolio/PortfolioHome'

export const dynamic = 'force-dynamic'

const DEFAULT_SPECIALTIES = [
  'Plataformas financeiras',
  'Produtos B2B e SaaS',
  'Sistemas complexos',
  'Ambientes regulados',
]

export default async function PortfolioPage() {
  const cases = getPublishedCasesPublic()

  let resume = null
  try {
    resume = getActiveResume()
  } catch {
    resume = null
  }

  const name = resume?.profile?.name ?? 'Eduardo Damasceno'
  const role = 'Designer de Produto Sênior'

  return (
    <PortfolioHome
      name={name}
      role={role}
      aboutHeading={portfolioAbout.heading}
      aboutIntro={portfolioAbout.intro}
      specialties={DEFAULT_SPECIALTIES}
      clients={portfolioClients}
      cases={cases}
    />
  )
}
