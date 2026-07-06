'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function registerPortfolioMotion() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** SplitType por caractere expande largura intrínseca no iOS — só em telas maiores. */
export function usePortfolioCharSplit(): boolean {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false
  return window.matchMedia('(min-width: 640px)').matches
}

export function bindScrollReveal(
  trigger: Element,
  timeline: gsap.core.Timeline
) {
  const enter = ScrollTrigger.create({
    trigger,
    start: 'top 60%',
    onEnter: () => timeline.play(),
  })

  const reset = ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    onLeaveBack: () => {
      timeline.progress(0)
      timeline.pause()
    },
  })

  return () => {
    enter.kill()
    reset.kill()
  }
}
