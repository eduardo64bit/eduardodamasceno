'use client'

import { DarkModeToggle } from '@/components/DarkModeToggle'

export function CVNav() {
  return (
    <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm dark:bg-gray-900/95">
      <nav className="sheet flex h-14 items-center justify-end">
        <DarkModeToggle />
      </nav>
    </div>
  )
}
