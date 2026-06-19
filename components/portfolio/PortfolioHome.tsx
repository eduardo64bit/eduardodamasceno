import type { CasePublic } from '@/lib/domains/cases/types'
import type { PortfolioClient } from '@/lib/portfolio/clients'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { ClientList } from './ClientList'
import { PortfolioNav } from './PortfolioNav'
import { CaseCard } from './CaseCard'
import { PortfolioChatLauncher } from './PortfolioChat'
import { HeroSection } from './motion/HeroSection'
import { FlyInText } from './motion/FlyInText'
import { RevealOnScroll } from './motion/RevealOnScroll'
import { StickyParallaxTitle } from './motion/StickyParallaxTitle'

const sectionGrid =
  'max-w-[80rem] mx-auto grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20 lg:items-start'
const sectionHeading =
  'text-2xl sm:text-3xl font-medium tracking-tight text-[var(--pf-text)] leading-snug'
const sectionBody =
  'text-base sm:text-lg font-light text-[var(--pf-muted-2)] leading-relaxed text-left'

interface Props {
  name: string
  role: string
  aboutHeading: string
  aboutIntro: string
  specialties: string[]
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
    <>
      <PortfolioNav name={name} />

      <HeroSection name={name} role={role} />

      <section className="px-6 sm:px-10 py-16 sm:py-24">
        <div className={sectionGrid}>
          <FlyInText as="h2" className={sectionHeading}>
            {aboutHeading}
          </FlyInText>
          <RevealOnScroll className="min-w-0">
            <p className={sectionBody}>{aboutIntro}</p>
          </RevealOnScroll>
        </div>
      </section>

      {specialties.length > 0 && (
        <section className="px-6 sm:px-10 py-12 sm:py-16 border-t border-[var(--pf-border)]">
          <div className={sectionGrid}>
            <FlyInText as="h2" className={sectionHeading}>
              {portfolioLabels.specialties}
            </FlyInText>
            <ul className="min-w-0 space-y-4">
              {specialties.map((item, i) => (
                <RevealOnScroll key={item} as="li" delay={i * 0.08}>
                  <span className={`flex items-center gap-4 ${sectionBody}`}>
                    <span className="text-[var(--pf-muted-3)] shrink-0" aria-hidden>
                      →
                    </span>
                    {item}
                  </span>
                </RevealOnScroll>
              ))}
            </ul>
          </div>
        </section>
      )}

      {clients.length > 0 && (
        <section className="px-6 sm:px-10 py-12 sm:py-16 border-t border-[var(--pf-border)]">
          <div className={sectionGrid}>
            <FlyInText as="h2" className={sectionHeading}>
              {portfolioLabels.experience}
            </FlyInText>
            <RevealOnScroll delay={0.1} className="min-w-0">
              <ClientList clients={clients} />
            </RevealOnScroll>
          </div>
        </section>
      )}

      <section id="projetos" className="py-16 sm:py-24 scroll-mt-[var(--pf-nav-offset,0px)]">
        <StickyParallaxTitle className="w-full text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.04em] text-center text-[var(--pf-text)] mb-12 sm:mb-16 sticky top-[var(--pf-nav-offset,0px)] z-40 py-4 pf-glass transition-[top] duration-300 ease-out will-change-[top]">
          {portfolioLabels.projects}
        </StickyParallaxTitle>

        <div className="max-w-[80rem] mx-auto px-6 sm:px-10">
          {cases.length === 0 ? (
            <p className="text-center text-[var(--pf-muted-3)] text-sm">
              {portfolioLabels.noCases}
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {cases.map((c, i) => (
                <li key={c.id}>
                  <CaseCard caseItem={c} revealDelay={(i % 4) * 0.05} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <footer id="contato" className="px-6 sm:px-10 py-24 sm:py-32 text-center border-t border-[var(--pf-border)]">
        <FlyInText
          as="h2"
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-[-0.04em] text-[var(--pf-text)] mb-8"
        >
          {portfolioLabels.contact}
        </FlyInText>
        <RevealOnScroll>
          <PortfolioChatLauncher />
        </RevealOnScroll>
      </footer>
    </>
  )
}
