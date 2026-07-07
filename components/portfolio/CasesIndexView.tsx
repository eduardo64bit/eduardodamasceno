import Link from 'next/link'
import type { CasePublic } from '@/lib/domains/cases/types'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { CaseProjectsSection } from './CaseProjectsSection'
import { PortfolioNav } from './PortfolioNav'

interface Props {
  name: string
  cases: CasePublic[]
}

export function CasesIndexView({ name, cases }: Props) {
  return (
    <>
      <PortfolioNav name={name} />

      <main className="min-h-screen pt-12 sm:pt-16 pb-20">
        <div className="max-w-[80rem] mx-auto px-6 sm:px-10">
          <Link
            href="/"
            className="text-sm text-[var(--pf-muted-3)] hover:text-[var(--pf-text)] transition mb-10 inline-flex items-center gap-2"
          >
            {portfolioLabels.backToHome}
          </Link>

          <header className="mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.04em] text-[var(--pf-text)]">
              {portfolioLabels.projects}
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg font-light text-[var(--pf-muted-2)] leading-relaxed">
              {portfolioLabels.casesIndexIntro}
            </p>
          </header>

          {cases.length === 0 ? (
            <p className="text-center text-[var(--pf-muted-3)] text-sm">{portfolioLabels.noCases}</p>
          ) : (
            <CaseProjectsSection cases={cases} />
          )}
        </div>
      </main>
    </>
  )
}
