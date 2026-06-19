'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import { bindScrollReveal, prefersReducedMotion, registerPortfolioMotion } from '@/lib/portfolio/motion'

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'

interface Props {
  children: string
  className?: string
  as?: Tag
}

export function FlyInText({ children, className, as: Tag = 'span' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    registerPortfolioMotion()
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      el.style.opacity = '1'
      return
    }

    const split = new SplitType(el, { types: 'words, chars' })
    const chars = el.querySelectorAll('.char')
    if (!chars.length) return

    gsap.set(chars, { xPercent: -100, opacity: 0 })
    gsap.set(el, { opacity: 1 })

    const tl = gsap.timeline({ paused: true })
    tl.to(chars, {
      xPercent: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.02,
    })

    const cleanupScroll = bindScrollReveal(el, tl)

    return () => {
      cleanupScroll()
      tl.kill()
      split.revert()
    }
  }, [children])

  return (
    <Tag ref={ref as never} className={`pf-split-text ${className ?? ''}`.trim()}>
      {children}
    </Tag>
  )
}
