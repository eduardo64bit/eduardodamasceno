import Link from 'next/link'
import { CaseEditor } from '@/components/editor/CaseEditor'
import { EditorHeader } from '@/components/editor/EditorHeader'

export const dynamic = 'force-dynamic'

export default function NewCasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EditorHeader title="Novo case" backHref="/editor/cases" backLabel="Cases" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CaseEditor slug="new" initial={null} />
      </main>
    </div>
  )
}
