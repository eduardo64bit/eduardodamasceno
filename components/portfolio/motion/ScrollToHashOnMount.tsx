'use client'

import { useEffect } from 'react'

function scrollToSectionId(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
}

/** Garante scroll para âncoras após navegação client-side do Next.js */
export function ScrollToHashOnMount() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const sectionParam = url.searchParams.get('section')

    if (sectionParam) {
      const scroll = () => scrollToSectionId(sectionParam)
      requestAnimationFrame(scroll)
      const timer = window.setTimeout(scroll, 100)
      url.searchParams.delete('section')
      window.history.replaceState(null, '', `${url.pathname}${url.hash}`)
      return () => window.clearTimeout(timer)
    }

    const hash = window.location.hash
    if (!hash) return

    const id = hash.slice(1)
    const scroll = () => scrollToSectionId(id)
    requestAnimationFrame(scroll)
    const timer = window.setTimeout(scroll, 100)

    return () => window.clearTimeout(timer)
  }, [])

  return null
}
