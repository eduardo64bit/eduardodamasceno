import { redirect } from 'next/navigation'
import { getActiveResume } from '@/lib/db'
import { isPortfolioAuthenticated } from '@/lib/domains/auth/portfolio'
import { getPublishedCasesPublic } from '@/lib/domains/cases/queries'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { CaseProjectsSection } from '@/components/portfolio/CaseProjectsSection'
import { PortfolioNav } from '@/components/portfolio/PortfolioNav'
import { StickyParallaxTitle } from '@/components/portfolio/motion/StickyParallaxTitle'
import { ScrollToHashOnMount } from '@/components/portfolio/motion/ScrollToHashOnMount'

export const dynamic = 'force-dynamic'

export default async function CasesIndexPage() {
  if (!(await isPortfolioAuthenticated())) {
    redirect(`/login?from=${encodeURIComponent('/cases')}`)
  }

  const cases = getPublishedCasesPublic()

  let name = 'Eduardo Damasceno'
  try {
    name = getActiveResume()?.profile?.name ?? name
  } catch {
    /* keep default */
  }

  return (
    <>
      <ScrollToHashOnMount />
      <PortfolioNav name={name} />

      <section className="overflow-x-clip py-16 sm:py-24 pt-24 sm:pt-28 scroll-mt-[var(--pf-nav-offset,0px)]">
        <StickyParallaxTitle className="w-full max-w-full px-4 text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.04em] text-center text-[var(--pf-text)] mb-12 sm:mb-16 sticky top-[var(--pf-nav-offset,0px)] z-40 py-4 pf-glass transition-[top] duration-300 ease-out will-change-[top]">
          {portfolioLabels.projects}
        </StickyParallaxTitle>

        <div className="max-w-[80rem] mx-auto px-6 sm:px-10">
          {cases.length === 0 ? (
            <p className="text-center text-[var(--pf-muted-3)] text-sm">
              {portfolioLabels.noCases}
            </p>
          ) : (
            <CaseProjectsSection cases={cases} />
          )}
        </div>
      </section>
    </>
  )
}
