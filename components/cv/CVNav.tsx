'use client'

import { DarkModeToggle } from '@/components/DarkModeToggle'

export function CVNav() {
  return (
    <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm dark:bg-gray-900/95">
      <nav className="sheet flex h-14 items-center justify-end gap-1">
        <a
          href="/cv/pdf"
          className="rounded-lg px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          PDF
        </a>
        <DarkModeToggle />
      </nav>
    </div>
  )
}
