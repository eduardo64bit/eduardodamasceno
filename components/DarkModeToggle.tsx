'use client'

import { useEffect, useState } from 'react'

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

  return (
    <button
      onClick={toggle}
      aria-pressed={isDark}
      aria-label="Alternar tema escuro/claro"
      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <span className="text-lg leading-none">{isDark ? '🌙' : '☀️'}</span>
      <span>{isDark ? 'Modo escuro' : 'Modo claro'}</span>
    </button>
  )
}
