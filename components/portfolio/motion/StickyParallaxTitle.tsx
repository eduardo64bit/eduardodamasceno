'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, registerPortfolioMotion } from '@/lib/portfolio/motion'

interface Props {
  children: React.ReactNode
  className?: string
}

/** Título sticky com leve parallax no scroll (estilo LATEST WORK) */
export function StickyParallaxTitle({ children, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    registerPortfolioMotion()
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) return

    const mobile = window.matchMedia('(max-width: 639px)').matches

    gsap.fromTo(
      el,
      mobile ? { opacity: 0.6 } : { scale: 0.92, opacity: 0.6 },
      {
        ...(mobile ? {} : { scale: 1 }),
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 35%',
          scrub: 0.5,
        },
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill()
      })
    }
  }, [children])

  return (
    <h2 ref={ref} className={className}>
      {children}
    </h2>
  )
}
