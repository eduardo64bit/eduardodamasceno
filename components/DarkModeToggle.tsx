'use client'

import { useEffect, useState } from 'react'
import { MaterialIcon } from '@/components/MaterialIcon'

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
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
