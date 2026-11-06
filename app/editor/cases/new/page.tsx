import Link from 'next/link'
import { CaseEditor } from '@/components/editor/CaseEditor'
export const dynamic = 'force-dynamic'

export default function NewCasePage() {
  return (
    <div className="min-h-screen">
      <main className="sheet py-8">
        <Link href="/editor/cases" className="text-sm text-gray-500 transition hover:text-gray-800">
          Cases
        </Link>
        <h1 className="mb-8 mt-2 text-xl font-semibold text-gray-900 dark:text-gray-50">Novo case</h1>
        <CaseEditor slug="new" initial={null} />
      </main>
    </div>
  )
}
