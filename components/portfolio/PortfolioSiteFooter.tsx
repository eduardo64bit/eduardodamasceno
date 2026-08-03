'use client'

import { useState } from 'react'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { LINKEDIN_URL } from '@/lib/site/urls'
import { PortfolioPrivacyModal } from './PortfolioPrivacyModal'

const linkClass =
  'block w-fit text-base text-[var(--pf-muted-2)] hover:text-[var(--pf-text)] transition-colors'

export function PortfolioSiteFooter() {
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const year = new Date().getFullYear()

  return (
    <>
      <footer className="mt-auto w-full bg-[var(--pf-surface-2)] text-[var(--pf-muted-2)]">
        <div className="mx-auto flex max-w-[80rem] flex-col gap-3 overflow-x-hidden px-6 py-8 sm:px-10 sm:py-9 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <nav className="flex flex-col gap-3" aria-label="Rodapé">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {portfolioLabels.footerLinkedIn}
            </a>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className={linkClass}
            >
              {portfolioLabels.footerPrivacy}
            </button>
          </nav>

          <p className="pt-8 text-sm text-[var(--pf-muted-3)] leading-relaxed">
            {portfolioLabels.footerLocation}
          </p>
          <p className="text-sm text-[var(--pf-muted-3)] leading-relaxed">
            © {year} Eduardo Damasceno
          </p>
        </div>
      </footer>

      <PortfolioPrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  )
}
