export type PortfolioThemeMode = 'auto' | 'light' | 'dark'
export type PortfolioThemeResolved = 'light' | 'dark'

export const PORTFOLIO_THEME_STORAGE_KEY = 'portfolio-theme-mode'

export const PORTFOLIO_THEME_DARK_BG = '#1a1a1a'
export const PORTFOLIO_THEME_LIGHT_BG = '#f4f4f5'

/** Inline no <head> — pinta html antes do React (evita flash e faixa no overscroll) */
export const PORTFOLIO_THEME_BOOT_SCRIPT = `(function(){try{var k='${PORTFOLIO_THEME_STORAGE_KEY}';var m=localStorage.getItem(k);var sys=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=m==='light'||m==='dark'?m:(sys?'dark':'light');var d=document.documentElement;d.setAttribute('data-portfolio-theme',t);d.style.colorScheme=t;var mc=document.querySelector('meta[name="theme-color"]');if(mc)mc.setAttribute('content',t==='dark'?'${PORTFOLIO_THEME_DARK_BG}':'${PORTFOLIO_THEME_LIGHT_BG}');var cv=localStorage.getItem('theme');if(cv==='dark')d.classList.add('dark');document.addEventListener('DOMContentLoaded',function(){var r=document.querySelector('.portfolio-theme');if(r)r.setAttribute('data-theme',t);});}catch(e){}})();`

/** Lê preferência salva (client-only). */
export function readStoredThemeMode(): PortfolioThemeMode {
  if (typeof window === 'undefined') return 'auto'
  try {
    const stored = localStorage.getItem(PORTFOLIO_THEME_STORAGE_KEY)
    if (stored === 'auto' || stored === 'light' || stored === 'dark') return stored
  } catch {
    /* ignore */
  }
  return 'auto'
}

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
