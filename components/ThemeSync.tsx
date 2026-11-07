'use client'

import { useEffect } from 'react'
import {
  applyResolvedTheme,
  readStoredThemeMode,
  resolveSharedTheme,
  themeFromSystem,
} from '@/lib/portfolio/theme'

/** Mantém currículo, editor e portfólio no mesmo tema, inclusive quando o sistema muda. */
export function ThemeSync() {
  useEffect(() => {
    const applyCurrent = () => applyResolvedTheme(resolveSharedTheme())
    applyCurrent()

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystem = () => {
      if (readStoredThemeMode() === 'auto') applyResolvedTheme(themeFromSystem())
    }
    mq.addEventListener('change', onSystem)
    return () => mq.removeEventListener('change', onSystem)
  }, [])

  return null
}
