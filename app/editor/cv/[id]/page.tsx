import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getResumeById } from '@/lib/db'
import { ResumeEditor } from '@/components/editor/editor/ResumeEditor'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CvEditPage({ params }: Props) {
  const { id } = await params

  const data = id === 'new' ? null : await getResumeById(id)

  if (id !== 'new' && !data) notFound()

  const title = data ? `Editando: ${data.resume.name}` : 'Novo currículo'

  return (
    <div className="min-h-screen">
      <main className="sheet py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Link href="/editor/cv" className="text-sm text-gray-500 transition hover:text-gray-800">
              Currículos
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-50">{title}</h1>
          </div>
          {data ? (
            <a
              href={`/editor/cv/${id}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 transition hover:text-gray-800"
            >
              Pré-visualizar PDF
            </a>
          ) : null}
        </div>
        <ResumeEditor id={id} initial={data} />
      </main>
    </div>
  )
}
