'use client'

import { useEffect } from 'react'

/** Garante scroll para âncoras após navegação client-side do Next.js */
export function ScrollToHashOnMount() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const id = hash.slice(1)
    const scrollToTarget = () => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    }

    requestAnimationFrame(scrollToTarget)
    const timer = window.setTimeout(scrollToTarget, 100)

    return () => window.clearTimeout(timer)
  }, [])

  return null
}
