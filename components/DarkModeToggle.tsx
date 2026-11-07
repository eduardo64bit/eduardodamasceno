'use client'

import { useEffect, useState } from 'react'
import { MaterialIcon } from '@/components/MaterialIcon'
import {
  applyResolvedTheme,
  persistManualTheme,
  THEME_CHANGE_EVENT,
} from '@/lib/portfolio/theme'

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains('dark'))
    sync()
    window.addEventListener(THEME_CHANGE_EVENT, sync)
    return () => window.removeEventListener(THEME_CHANGE_EVENT, sync)
  }, [])

  function toggle() {
    const next = isDark ? 'light' : 'dark'
    persistManualTheme(next)
    applyResolvedTheme(next)
    setIsDark(next === 'dark')
  }

  const label = isDark ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <MaterialIcon name={isDark ? 'light_mode' : 'dark_mode'} />
    </button>
  )
}
