'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import { prefersReducedMotion, registerPortfolioMotion } from '@/lib/portfolio/motion'
import { ScrollHint } from './ScrollHint'

interface Props {
  name: string
  role: string
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

    if (prefersReducedMotion()) {
      nameEl.style.opacity = '1'
      if (content) content.style.opacity = '1'
      if (scrollHint) scrollHint.style.opacity = '1'
      return
    }

    const split = new SplitType(nameEl, { types: 'words, chars' })
    const chars = nameEl.querySelectorAll('.char')

    gsap.set(nameEl, { opacity: 1 })
    gsap.set(chars, { opacity: 0, y: 48 })
    if (content) gsap.set(content, { opacity: 0, y: 40 })
    if (scrollHint) gsap.set(scrollHint, { opacity: 0, y: 12 })

    const loadTl = gsap.timeline({ delay: 0.15 })
    loadTl.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.025,
    })
    if (content) {
      loadTl.to(
        content,
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.35'
      )
    }
    if (scrollHint) {
      loadTl.to(
        scrollHint,
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
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
      split.revert()
      cleanups.forEach((fn) => fn())
    }
  }, [name, role])

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
          className="absolute top-[35%] left-[15%] w-64 h-64 rounded-full blur-2xl"
          style={{ backgroundColor: 'var(--pf-blob)' }}
        />
        <div
          className="absolute top-[25%] right-[10%] w-48 h-48 rounded-full blur-2xl"
          style={{ backgroundColor: 'var(--pf-blob)' }}
        />
      </div>

      <div ref={heroGroupRef} className="flex flex-col items-center">
        <h1
          ref={nameRef}
          className="hero-name pf-split-text text-[clamp(2.25rem,10vw,7.5rem)] font-bold uppercase tracking-[-0.03em] leading-[0.95] text-[var(--pf-text)] opacity-0 max-w-[95vw]"
        >
          {name}
        </h1>

        <div ref={contentRef} className="opacity-0">
          <p className="hero-role pf-no-break mt-6 text-lg sm:text-2xl font-light text-[var(--pf-muted)] tracking-wide max-w-[20rem] sm:max-w-none mx-auto">
            {role}
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
