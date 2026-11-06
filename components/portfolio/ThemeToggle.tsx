'use client'

import { useEffect, useState } from 'react'
import { MaterialIcon } from '@/components/MaterialIcon'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { usePortfolioTheme } from './PortfolioThemeProvider'

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
      <MaterialIcon name="light_mode" />
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
      <MaterialIcon name={isDark ? 'light_mode' : 'dark_mode'} />
    </button>
  )
}
