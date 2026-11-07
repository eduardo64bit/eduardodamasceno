export type PortfolioThemeMode = 'auto' | 'light' | 'dark'
export type PortfolioThemeResolved = 'light' | 'dark'

export const PORTFOLIO_THEME_STORAGE_KEY = 'portfolio-theme-mode'
/** Chave antiga do currículo e do editor. Mantida igual à do portfólio. */
export const CV_THEME_STORAGE_KEY = 'theme'

export const THEME_CHANGE_EVENT = 'site-theme'

export const PORTFOLIO_THEME_DARK_BG = '#1a1a1a'
export const PORTFOLIO_THEME_LIGHT_BG = '#f4f4f5'

/** Inline no <head> — pinta html antes do React (evita flash e faixa no overscroll) */
export const PORTFOLIO_THEME_BOOT_SCRIPT = `(function(){try{var k='${PORTFOLIO_THEME_STORAGE_KEY}';var legacyKey='${CV_THEME_STORAGE_KEY}';var m=localStorage.getItem(k);var legacy=localStorage.getItem(legacyKey);var explicit=(m==='light'||m==='dark')?m:(m==='auto'?null:(legacy==='light'||legacy==='dark'?legacy:null));var sys=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=explicit||(sys?'dark':'light');if(explicit){if(m!==explicit)localStorage.setItem(k,explicit);if(legacy!==explicit)localStorage.setItem(legacyKey,explicit);}var d=document.documentElement;d.setAttribute('data-portfolio-theme',t);d.style.colorScheme=t;d.classList.toggle('dark',t==='dark');var mc=document.querySelector('meta[name="theme-color"]');if(mc)mc.setAttribute('content',t==='dark'?'${PORTFOLIO_THEME_DARK_BG}':'${PORTFOLIO_THEME_LIGHT_BG}');document.addEventListener('DOMContentLoaded',function(){var r=document.querySelector('.portfolio-theme');if(r)r.setAttribute('data-theme',t);});}catch(e){}})();`

/** Preferência explícita. `auto` no portfólio ignora a chave antiga e volta a seguir o sistema. */
export function readStoredThemeMode(): PortfolioThemeMode {
  if (typeof window === 'undefined') return 'auto'
  try {
    const stored = localStorage.getItem(PORTFOLIO_THEME_STORAGE_KEY)
    if (stored === 'auto' || stored === 'light' || stored === 'dark') return stored
    const legacy = localStorage.getItem(CV_THEME_STORAGE_KEY)
    if (legacy === 'light' || legacy === 'dark') return legacy
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

export function resolveSharedTheme(): PortfolioThemeResolved {
  return resolvePortfolioTheme(readStoredThemeMode())
}

/** Grava a escolha manual nas duas chaves, para portfólio, currículo e editor. */
export function persistManualTheme(resolved: PortfolioThemeResolved) {
  try {
    localStorage.setItem(PORTFOLIO_THEME_STORAGE_KEY, resolved)
    localStorage.setItem(CV_THEME_STORAGE_KEY, resolved)
  } catch {
    /* ignore */
  }
}

/** Aplica o tema resolvido no documento inteiro. */
export function applyResolvedTheme(resolved: PortfolioThemeResolved) {
  const root = document.documentElement
  root.setAttribute('data-portfolio-theme', resolved)
  root.style.colorScheme = resolved
  root.classList.toggle('dark', resolved === 'dark')

  document.querySelector('.portfolio-theme')?.setAttribute('data-theme', resolved)

  const themeColor = resolved === 'dark' ? PORTFOLIO_THEME_DARK_BG : PORTFOLIO_THEME_LIGHT_BG
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)

  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: resolved }))
}

/** Alterna tema manual (sai do automático) */
export function toggleManualTheme(resolved: PortfolioThemeResolved): PortfolioThemeMode {
  return resolved === 'dark' ? 'light' : 'dark'
}
