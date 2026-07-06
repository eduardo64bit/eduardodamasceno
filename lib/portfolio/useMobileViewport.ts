'use client'

import { useEffect, useState } from 'react'

export type MobileViewportLayout = {
  top: number
  left: number
  width: number
  height: number
}

/** Alinha overlays fixos à largura real do viewport no iOS (visualViewport). */
export function useMobileViewport(active: boolean) {
  const [layout, setLayout] = useState<MobileViewportLayout | null>(null)

  useEffect(() => {
    if (!active) {
      setLayout(null)
      return
    }

    const mq = window.matchMedia('(max-width: 639px)')

    const update = () => {
      if (!mq.matches) {
        setLayout(null)
        return
      }

      const vv = window.visualViewport
      setLayout({
        top: vv?.offsetTop ?? 0,
        left: vv?.offsetLeft ?? 0,
        width: vv?.width ?? window.innerWidth,
        height: vv?.height ?? window.innerHeight,
      })
    }

    update()
    const vv = window.visualViewport
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    mq.addEventListener('change', update)
    window.addEventListener('orientationchange', update)

    return () => {
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
      mq.removeEventListener('change', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [active])

  return layout
}
