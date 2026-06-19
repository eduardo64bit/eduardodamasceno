'use client'

import { portfolioLabels } from '@/lib/portfolio/copy'
import { PortfolioModal } from './PortfolioModal'

interface Props {
  open: boolean
  onClose: () => void
}

const privacyParagraphs = [
  portfolioLabels.privacyIntro,
  portfolioLabels.privacyPortfolio,
  portfolioLabels.privacyChat,
  portfolioLabels.privacyTechnical,
  portfolioLabels.privacyContact,
] as const

export function PortfolioPrivacyModal({ open, onClose }: Props) {
  return (
    <PortfolioModal
      open={open}
      onClose={onClose}
      title={portfolioLabels.privacyTitle}
      ariaLabel={portfolioLabels.privacyTitle}
      closeLabel={portfolioLabels.privacyClose}
    >
      <div className="space-y-5 text-sm font-light leading-relaxed text-[var(--pf-chat-text)]">
        {privacyParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </PortfolioModal>
  )
}
