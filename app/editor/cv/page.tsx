import Link from 'next/link'
import { getAllResumes } from '@/lib/db'
import { ResumeCard } from '@/components/editor/ResumeCard'

export const dynamic = 'force-dynamic'

export default async function CvListPage() {
  const resumes = await getAllResumes()

  return (
    <div className="min-h-screen">
      <main className="sheet py-8">
        <Link href="/editor" className="text-sm text-gray-500 transition hover:text-gray-800">
          Editor
        </Link>
        <div className="mt-2 mb-6 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            Currículos ({resumes.length})
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/cv" className="text-sm text-gray-500 transition hover:text-gray-800">
              Ver CV
            </Link>
            <Link
              href="/editor/cv/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + Novo currículo
            </Link>
          </div>
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
