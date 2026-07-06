'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, registerPortfolioMotion } from '@/lib/portfolio/motion'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'span'
}

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  y = 40,
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    registerPortfolioMotion()
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    gsap.set(el, { autoAlpha: 0, y })

    const tl = gsap.timeline({ paused: true, delay })
    tl.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out',
    })

    const enter = ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      onEnter: () => tl.play(),
    })

    const reset = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      onLeaveBack: () => {
        tl.progress(0)
        tl.pause()
      },
    })

    return () => {
      enter.kill()
      reset.kill()
      tl.kill()
    }
  }, [delay, y])

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  )
}
