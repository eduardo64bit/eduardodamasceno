import Link from 'next/link'
import { PortfolioChatButton, PortfolioChatRoot } from '@/components/portfolio/PortfolioChat'
import { PortfolioLoginForm } from '@/components/portfolio/PortfolioLoginForm'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { portfolioLoginBackHref } from '@/lib/portfolio/routes'

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function PortfolioLoginPage({ searchParams }: Props) {
  const { from } = await searchParams
  const backHref = portfolioLoginBackHref(from)
  const backLabel =
    from?.startsWith('/portfolio') ? portfolioLabels.backToProjects : portfolioLabels.backToHome

  return (
    <PortfolioChatRoot>
      <main className="min-h-screen flex items-center justify-center px-6 sm:px-10 py-24">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--pf-muted-3)] mb-3">
              {portfolioLabels.loginRestrictedLabel}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--pf-text)]">
              {portfolioLabels.loginTitle}
            </h1>
            <div className="mt-3 space-y-2 text-sm text-[var(--pf-muted-2)] leading-relaxed">
              <p>{portfolioLabels.loginConfidentiality}</p>
              <p>{portfolioLabels.loginPasswordHint}</p>
              <p>{portfolioLabels.loginContactHint}</p>
            </div>
            <div className="mt-5 flex justify-center">
              <PortfolioChatButton />
            </div>
          </div>

          <PortfolioLoginForm from={from} />

          <p className="mt-8 text-center">
            <Link
              href={backHref}
              className="text-sm text-[var(--pf-muted-3)] hover:text-[var(--pf-text)] transition"
            >
              {backLabel}
            </Link>
          </p>
        </div>
      </main>
    </PortfolioChatRoot>
  )
}
