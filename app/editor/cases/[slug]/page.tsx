import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCaseFullBySlug } from '@/lib/domains/cases/queries'
import { CaseEditor } from '@/components/editor/CaseEditor'
import { EditorHeader } from '@/components/editor/EditorHeader'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditCasePage({ params }: Props) {
  const { slug } = await params

  if (slug === 'new') notFound()

  const data = getCaseFullBySlug(slug)
  if (!data) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <EditorHeader
        title={data.title}
        backHref="/editor/cases"
        backLabel="Cases"
        trailing={
          <Link
            href={`/cases/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-800 transition"
          >
            Preview
          </Link>
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CaseEditor slug={slug} initial={data} />
      </main>
    </div>
  )
}
