'use client'

import { useEffect } from 'react'

/** Editor admin is light-only; restore public dark preference on unmount. */
export function EditorLightTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains('dark')
    root.classList.remove('dark')

    return () => {
      if (hadDark || localStorage.getItem('theme') === 'dark') {
        root.classList.add('dark')
      }
    }
  }, [])

  return <>{children}</>
}
