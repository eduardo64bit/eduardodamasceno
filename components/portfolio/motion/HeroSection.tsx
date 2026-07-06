'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import {
  prefersReducedMotion,
  registerPortfolioMotion,
  usePortfolioCharSplit,
} from '@/lib/portfolio/motion'
import { portfolioHero } from '@/lib/portfolio/copy'
import { ScrollHint } from './ScrollHint'

interface Props {
  name: string
  role: string
}

function heroNameLines(name: string): string[] {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return [name.trim()]
  return [parts[0], parts.slice(1).join(' ')]
}

export function HeroSection({ name, role }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const heroGroupRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerPortfolioMotion()
    const section = sectionRef.current
    const bg = bgRef.current
    const heroGroup = heroGroupRef.current
    const nameEl = nameRef.current
    const content = contentRef.current
    const scrollHint = scrollHintRef.current
    if (!section || !nameEl || !heroGroup) return

    const cleanups: (() => void)[] = []
    const splits: SplitType[] = []

    if (prefersReducedMotion()) {
      nameEl.style.opacity = '1'
      if (content) content.style.opacity = '1'
      if (scrollHint) scrollHint.style.opacity = '1'
      return
    }

    const charSplit = usePortfolioCharSplit()
    const loadTl = gsap.timeline({ delay: 0.15 })
    const lineEls = nameEl.querySelectorAll<HTMLElement>('.hero-name-line')

    if (charSplit && lineEls.length > 0) {
      lineEls.forEach((line) => {
        splits.push(new SplitType(line, { types: 'chars' }))
      })
      const chars = nameEl.querySelectorAll('.char')

      gsap.set(nameEl, { opacity: 1 })
      gsap.set(chars, { opacity: 0, y: 48 })

      loadTl.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.025,
      })
    } else {
      gsap.set(nameEl, { opacity: 0, y: 32 })
      loadTl.to(nameEl, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power2.out',
      })
    }

    if (content) {
      gsap.set(content, { opacity: 0, y: 40 })
      loadTl.to(
        content,
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        charSplit ? '-=0.35' : '-=0.4'
      )
    }
    if (scrollHint) {
      gsap.set(scrollHint, { opacity: 0, y: 12 })
      loadTl.to(
        scrollHint,
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        '-=0.25'
      )
    }

    if (bg) {
      const parallax = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        onUpdate: (self) => {
          gsap.set(bg, { y: self.progress * 140 })
        },
      })
      cleanups.push(() => parallax.kill())
    }

    const heroParallax = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(heroGroup, { y: self.progress * 80 })
      },
    })
    cleanups.push(() => heroParallax.kill())

    if (scrollHint) {
      const hideHint = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=100',
        scrub: true,
        onUpdate: (self) => {
          gsap.set(scrollHint, { opacity: 1 - self.progress, y: self.progress * 16 })
        },
      })
      cleanups.push(() => hideHint.kill())
    }

    return () => {
      loadTl.kill()
      splits.forEach((s) => s.revert())
      cleanups.forEach((fn) => fn())
    }
  }, [name, role])

  const nameLines = heroNameLines(name)

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 sm:px-10 pt-24 pb-28 sm:pb-32 text-center overflow-hidden"
    >
      <div
        ref={bgRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 will-change-transform"
      >
        <div
          className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[min(90vw,56rem)] h-[min(60vw,36rem)] rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--pf-blob)' }}
        />
        <div
          className="absolute top-[35%] left-[15%] w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-2xl"
          style={{ backgroundColor: 'var(--pf-blob)' }}
        />
        <div
          className="absolute top-[25%] right-[10%] w-36 h-36 sm:w-48 sm:h-48 rounded-full blur-2xl"
          style={{ backgroundColor: 'var(--pf-blob)' }}
        />
      </div>

      <div ref={heroGroupRef} className="flex w-full min-w-0 max-w-full flex-col items-center">
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <h1
            ref={nameRef}
            className="hero-name pf-split-text flex w-full min-w-0 max-w-full flex-col items-center text-[clamp(1.875rem,8.5vw,7.5rem)] font-bold uppercase tracking-[-0.03em] leading-[0.95] text-[var(--pf-text)] opacity-0"
          >
            {nameLines.map((line, i) => (
              <span key={i} className="hero-name-line block">
                {line}
              </span>
            ))}
          </h1>
        </div>

        <div ref={contentRef} className="w-full min-w-0 max-w-full opacity-0">
          <p className="hero-role mt-6 max-w-full text-lg sm:text-2xl font-light text-[var(--pf-muted)] tracking-wide sm:max-w-none mx-auto">
            <span className="sm:hidden">
              {portfolioHero.roleLines[0]}
              <br />
              {portfolioHero.roleLines[1]}
            </span>
            <span className="hidden sm:inline pf-no-break">{role}</span>
          </p>
        </div>
      </div>

      <div
        ref={scrollHintRef}
        className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 opacity-0"
      >
        <ScrollHint />
      </div>
    </section>
  )
}
