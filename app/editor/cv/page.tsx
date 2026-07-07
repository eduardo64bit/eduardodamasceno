import Link from 'next/link'
import { getAllResumes } from '@/lib/db'
import { EditorHeader } from '@/components/editor/EditorHeader'
import { ResumeCard } from '@/components/editor/ResumeCard'

export const dynamic = 'force-dynamic'

export default async function CvListPage() {
  const resumes = await getAllResumes()

  return (
    <div className="min-h-screen bg-gray-50">
      <EditorHeader
        title="Currículos"
        backHref="/editor"
        backLabel="Editor"
        trailing={
          <Link href="/cv" className="text-sm text-gray-500 hover:text-gray-800 transition">
            Ver CV
          </Link>
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Currículos ({resumes.length})
          </h1>
          <Link
            href="/editor/cv/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Novo currículo
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Nenhum currículo cadastrado.</p>
            <p className="text-sm mt-1">Execute o seed SQL para criar o currículo base.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
