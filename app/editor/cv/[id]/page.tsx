import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getResumeById } from '@/lib/db'
import { EditorHeader } from '@/components/editor/EditorHeader'
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <EditorHeader
        title={title}
        backHref="/editor/cv"
        backLabel="Currículos"
        trailing={
          data ? (
            <a
              href={`/editor/cv/${id}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-800 transition"
            >
              Pré-visualizar PDF
            </a>
          ) : undefined
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <ResumeEditor id={id} initial={data} />
      </main>
    </div>
  )
}
