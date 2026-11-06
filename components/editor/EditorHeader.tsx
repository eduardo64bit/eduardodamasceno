'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/editor/actions'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { MaterialIcon } from '@/components/MaterialIcon'

const links = [
  { href: '/editor/cv', label: 'Currículos', match: (path: string) => path.startsWith('/editor/cv') },
  { href: '/editor/cases', label: 'Cases', match: (path: string) => path.startsWith('/editor/cases') },
  { href: '/editor/status', label: 'Status', match: (path: string) => path.startsWith('/editor/status') },
]

export function EditorHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <nav className="sheet flex h-14 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href="/editor"
            className="shrink-0 text-sm font-medium tracking-wide text-gray-900 transition hover:text-gray-600 dark:text-gray-100 dark:hover:text-white"
          >
            ED
          </Link>
          <div className="flex items-center gap-4 overflow-x-auto">
            {links.map((link) => {
              const active = link.match(pathname)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 text-sm transition ${
                    active
                      ? 'font-medium text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <DarkModeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sair"
              title="Sair"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <MaterialIcon name="logout" />
            </button>
          </form>
        </div>
      </nav>
    </header>
  )
}
