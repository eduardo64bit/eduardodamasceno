import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listCaseMediaPublicPathsOnDisk } from '@/lib/domains/cases/media-storage'
import { getCaseFullBySlug } from '@/lib/domains/cases/queries'
import { CaseEditor } from '@/components/editor/CaseEditor'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditCasePage({ params }: Props) {
  const { slug } = await params

  if (slug === 'new') notFound()

  const data = getCaseFullBySlug(slug)
  if (!data) notFound()

  const diskMediaPaths = listCaseMediaPublicPathsOnDisk(slug)

  return (
    <div className="min-h-screen">
      <main className="sheet py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Link href="/editor/cases" className="text-sm text-gray-500 transition hover:text-gray-800">
              Cases
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-50">{data.title}</h1>
          </div>
          <Link
            href={`/portfolio/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 transition hover:text-gray-800"
          >
            Preview
          </Link>
        </div>
        <CaseEditor slug={slug} initial={data} diskMediaPaths={diskMediaPaths} />
      </main>
    </div>
  )
}
