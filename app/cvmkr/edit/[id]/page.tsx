import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getResumeById } from '@/lib/db'
import { ResumeEditor } from '@/components/cvmkr/editor/ResumeEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: Props) {
  const { id } = await params

  // "new" is a reserved id for creating a blank resume
  const data = id === 'new' ? null : await getResumeById(id)

  if (id !== 'new' && !data) notFound()

  const title = data ? `Editando: ${data.resume.name}` : 'Novo currículo'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/cvmkr/dashboard"
              className="text-gray-400 hover:text-gray-800 transition shrink-0"
            >
              ← Dashboard
            </Link>
            <span className="text-gray-300 shrink-0">|</span>
            <span className="text-sm text-gray-600 truncate">{title}</span>
          </div>

          {data && (
            <a
              href={`/cvmkr/print/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-800 transition shrink-0"
            >
              Pré-visualizar PDF
            </a>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <ResumeEditor id={id} initial={data} />
      </main>
    </div>
  )
}
