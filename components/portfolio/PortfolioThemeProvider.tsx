'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  PORTFOLIO_THEME_STORAGE_KEY,
  PORTFOLIO_THEME_DARK_BG,
  PORTFOLIO_THEME_LIGHT_BG,
  readStoredThemeMode,
  themeFromSystem,
  toggleManualTheme,
  type PortfolioThemeMode,
  type PortfolioThemeResolved,
} from '@/lib/portfolio/theme'

interface PortfolioThemeContextValue {
  mode: PortfolioThemeMode
  resolved: PortfolioThemeResolved
  toggleTheme: () => void
}

const PortfolioThemeContext = createContext<PortfolioThemeContextValue | null>(null)

export function usePortfolioTheme() {
  const ctx = useContext(PortfolioThemeContext)
  if (!ctx) {
    throw new Error('usePortfolioTheme must be used within PortfolioThemeProvider')
  }
  return ctx
}

interface Props {
  children: React.ReactNode
  className?: string
}

export function PortfolioThemeProvider({ children, className }: Props) {
  const [mode, setMode] = useState<PortfolioThemeMode>(readStoredThemeMode)
  const [systemTheme, setSystemTheme] = useState<PortfolioThemeResolved>(() =>
    typeof window !== 'undefined' ? themeFromSystem() : 'dark'
  )

  const resolved: PortfolioThemeResolved = mode === 'auto' ? systemTheme : mode

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystem = () => setSystemTheme(mq.matches ? 'dark' : 'light')
    syncSystem()
    mq.addEventListener('change', syncSystem)
    return () => mq.removeEventListener('change', syncSystem)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-portfolio-theme', resolved)
    root.style.colorScheme = resolved

    const themeColor = resolved === 'dark' ? PORTFOLIO_THEME_DARK_BG : PORTFOLIO_THEME_LIGHT_BG
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)
  }, [resolved])

  const toggleTheme = useCallback(() => {
    setMode((current) => {
      const currentResolved = current === 'auto' ? themeFromSystem() : current
      const next = toggleManualTheme(currentResolved)
      try {
        localStorage.setItem(PORTFOLIO_THEME_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return (
    <PortfolioThemeContext.Provider value={{ mode, resolved, toggleTheme }}>
      <div
        className={`portfolio-theme ${className ?? ''} flex min-h-screen w-full max-w-full flex-col antialiased bg-[var(--pf-bg)] text-[var(--pf-text)] transition-colors duration-300`}
        data-theme={resolved}
        lang="pt-BR"
        suppressHydrationWarning
      >
        {children}
      </div>
    </PortfolioThemeContext.Provider>
  )
}
