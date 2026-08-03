import type { CasePublic } from '@/lib/domains/cases/types'
import type { PortfolioClient } from '@/lib/portfolio/clients'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { SHOW_HOME_PROJECTS } from '@/lib/portfolio/features'
import { LINKEDIN_URL } from '@/lib/site/urls'
import { PORTFOLIO_PROJECTS_SECTION_ID } from '@/lib/portfolio/routes'
import { ClientList } from './ClientList'
import { PortfolioNav } from './PortfolioNav'
import { CaseProjectsSection } from './CaseProjectsSection'
import { PortfolioChatButton, PortfolioChatRoot } from './PortfolioChat'
import { HeroSection } from './motion/HeroSection'
import { FlyInText } from './motion/FlyInText'
import { RevealOnScroll } from './motion/RevealOnScroll'
import { ScrollToHashOnMount } from './motion/ScrollToHashOnMount'
import { StickyParallaxTitle } from './motion/StickyParallaxTitle'

const sectionGrid =
  'max-w-[80rem] mx-auto grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20 lg:items-start'
const sectionHeading =
  'text-2xl sm:text-3xl font-medium tracking-tight text-[var(--pf-text)] leading-snug'
const sectionBody =
  'text-base sm:text-lg font-light text-[var(--pf-muted-2)] leading-relaxed text-left break-words [overflow-wrap:anywhere]'

const ctaButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--pf-surface-2)] px-6 py-2.5 text-base text-[var(--pf-muted-2)] transition-colors duration-300 hover:bg-[var(--pf-btn-hover-bg)] hover:text-[var(--pf-btn-hover-text)] sm:text-lg'

interface Props {
  name: string
  role: string
  aboutHeading: string
  aboutIntro: readonly string[]
  specialties: readonly string[]
  clients: PortfolioClient[]
  cases: CasePublic[]
}

export function PortfolioHome({
  name,
  role,
  aboutHeading,
  aboutIntro,
  specialties,
  clients,
  cases,
}: Props) {
  return (
    <PortfolioChatRoot>
      <ScrollToHashOnMount />
      <PortfolioNav name={name} />

      <HeroSection name={name} role={role} />

      <section className="overflow-x-hidden px-6 sm:px-10 py-16 sm:py-24">
        <div className={sectionGrid}>
          <FlyInText as="h2" className={`min-w-0 ${sectionHeading}`}>
            {aboutHeading}
          </FlyInText>
          <RevealOnScroll className="min-w-0 space-y-6">
            {aboutIntro.map((paragraph, i) => (
              <p key={i} className={sectionBody}>
                {paragraph}
              </p>
            ))}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={ctaButtonClass}
              >
                {portfolioLabels.footerLinkedIn}
              </a>
              <PortfolioChatButton />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {specialties.length > 0 && (
        <section className="overflow-x-hidden px-6 sm:px-10 py-12 sm:py-16 border-t border-[var(--pf-border)]">
          <div className={sectionGrid}>
            <FlyInText as="h2" className={`min-w-0 ${sectionHeading}`}>
              {portfolioLabels.specialties}
            </FlyInText>
            <div className="min-w-0">
              <ul className="space-y-4">
                {specialties.map((item, i) => (
                  <RevealOnScroll key={item} as="li" delay={i * 0.08}>
                    <span className={`flex min-w-0 items-start gap-4 break-words ${sectionBody}`}>
                      <span className="text-[var(--pf-muted-3)] shrink-0" aria-hidden>
                        →
                      </span>
                      {item}
                    </span>
                  </RevealOnScroll>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {clients.length > 0 && (
        <section className="overflow-x-hidden px-6 sm:px-10 py-12 sm:py-16 border-t border-[var(--pf-border)]">
          <div className={sectionGrid}>
            <FlyInText as="h2" className={`min-w-0 ${sectionHeading}`}>
              {portfolioLabels.experience}
            </FlyInText>
            <RevealOnScroll delay={0.1} className="min-w-0">
              <ClientList clients={clients} />
            </RevealOnScroll>
          </div>
        </section>
      )}

      {SHOW_HOME_PROJECTS && (
        <section
          id={PORTFOLIO_PROJECTS_SECTION_ID}
          className="overflow-x-clip py-16 sm:py-24 scroll-mt-[var(--pf-nav-offset,0px)]"
        >
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
      )}

      <footer id="contato" className="overflow-x-hidden px-6 sm:px-10 py-24 sm:py-32 text-center border-t border-[var(--pf-border)]">
        <FlyInText
          as="h2"
          className="mx-auto max-w-full min-w-0 px-2 text-4xl sm:text-6xl font-extrabold uppercase tracking-[-0.04em] text-[var(--pf-text)] mb-8"
        >
          {portfolioLabels.contact}
        </FlyInText>
        <RevealOnScroll>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaButtonClass}
            >
              {portfolioLabels.footerLinkedIn}
            </a>
            <PortfolioChatButton />
          </div>
        </RevealOnScroll>
      </footer>
    </PortfolioChatRoot>
  )
}
