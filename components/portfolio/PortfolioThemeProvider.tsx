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
  const [mode, setMode] = useState<PortfolioThemeMode>('auto')
  const [systemTheme, setSystemTheme] = useState<PortfolioThemeResolved>(() =>
    typeof window !== 'undefined' ? themeFromSystem() : 'dark'
  )
  const [ready, setReady] = useState(false)

  const resolved: PortfolioThemeResolved = mode === 'auto' ? systemTheme : mode

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PORTFOLIO_THEME_STORAGE_KEY)
      if (stored === 'auto' || stored === 'light' || stored === 'dark') {
        setMode(stored)
      }
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystem = () => setSystemTheme(mq.matches ? 'dark' : 'light')
    syncSystem()
    mq.addEventListener('change', syncSystem)
    return () => mq.removeEventListener('change', syncSystem)
  }, [])

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
        className={`portfolio-theme ${className ?? ''} flex min-h-screen flex-col antialiased bg-[var(--pf-bg)] text-[var(--pf-text)] transition-colors duration-300`}
        data-theme={resolved}
        lang="pt-BR"
        suppressHydrationWarning
        style={ready ? undefined : { visibility: 'hidden' }}
      >
        {children}
      </div>
    </PortfolioThemeContext.Provider>
  )
}
