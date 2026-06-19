export type PortfolioThemeMode = 'auto' | 'light' | 'dark'
export type PortfolioThemeResolved = 'light' | 'dark'

export const PORTFOLIO_THEME_STORAGE_KEY = 'portfolio-theme-mode'

/** Segue prefers-color-scheme do sistema operacional */
export function themeFromSystem(): PortfolioThemeResolved {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolvePortfolioTheme(mode: PortfolioThemeMode): PortfolioThemeResolved {
  if (mode === 'auto') return themeFromSystem()
  return mode
}

/** Alterna tema manual (sai do automático) */
export function toggleManualTheme(resolved: PortfolioThemeResolved): PortfolioThemeMode {
  return resolved === 'dark' ? 'light' : 'dark'
}
