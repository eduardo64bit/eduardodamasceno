'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import {
  bindScrollReveal,
  prefersReducedMotion,
  registerPortfolioMotion,
  usePortfolioCharSplit,
} from '@/lib/portfolio/motion'

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

    const charSplit = usePortfolioCharSplit()
    const tl = gsap.timeline({ paused: true })

    if (charSplit) {
      const split = new SplitType(el, { types: 'words, chars' })
      const chars = el.querySelectorAll('.char')
      if (!chars.length) return

      gsap.set(chars, { opacity: 0, y: 14 })
      gsap.set(el, { opacity: 1 })

      tl.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.02,
      })

      const cleanupScroll = bindScrollReveal(el, tl)

      return () => {
        cleanupScroll()
        tl.kill()
        split.revert()
      }
    }

    gsap.set(el, { autoAlpha: 0, y: 20 })
    tl.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    })

    const cleanupScroll = bindScrollReveal(el, tl)

    return () => {
      cleanupScroll()
      tl.kill()
    }
  }, [children])

  return (
    <Tag ref={ref as never} className={`pf-split-text ${className ?? ''}`.trim()}>
      {children}
    </Tag>
  )
}
