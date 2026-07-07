'use client'

import { useEffect, useState } from 'react'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { usePortfolioTheme } from './PortfolioThemeProvider'

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  )
}

/** Placeholder idêntico ao SSR (tema escuro padrão no servidor). */
function ThemeTogglePlaceholder({ tabIndex }: { tabIndex?: number }) {
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      className="pointer-events-auto flex items-center justify-center w-9 h-9 rounded-lg text-[var(--pf-muted-2)]"
      aria-label={portfolioLabels.themeLight}
      title={portfolioLabels.themeLight}
      suppressHydrationWarning
    >
      <SunIcon />
    </button>
  )
}

export function ThemeToggle({ tabIndex }: { tabIndex?: number }) {
  const { resolved, toggleTheme } = usePortfolioTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <ThemeTogglePlaceholder tabIndex={tabIndex} />
  }

  const isDark = resolved === 'dark'
  const label = isDark ? portfolioLabels.themeLight : portfolioLabels.themeDark

  return (
    <button
      type="button"
      onClick={toggleTheme}
      tabIndex={tabIndex}
      className="pointer-events-auto flex items-center justify-center w-9 h-9 rounded-lg text-[var(--pf-muted-2)] hover:text-[var(--pf-text)] hover:bg-[var(--pf-border)] transition-colors"
      aria-label={label}
      title={label}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
