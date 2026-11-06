'use client'

import { usePathname } from 'next/navigation'
import { EditorHeader } from '@/components/editor/EditorHeader'

export function EditorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/editor/login'

  return (
    <div className="editor-admin min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {!isLogin && <EditorHeader />}
      {children}
    </div>
  )
}
