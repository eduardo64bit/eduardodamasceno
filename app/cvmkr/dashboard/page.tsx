import Link from 'next/link'
import { getAllResumes } from '@/lib/db'
import { ResumeCard } from '@/components/cvmkr/ResumeCard'
import { logoutAction } from './actions'

export default async function DashboardPage() {
  const resumes = await getAllResumes()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">CVMKR</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-800 transition"
            >
              Ver CV público
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-800 transition"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Currículos ({resumes.length})
          </h1>
          <NewResumeButton />
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

// ── New Resume button (client-side prompt pattern via link to edit/:new) ──────
function NewResumeButton() {
  return (
    <Link
      href="/cvmkr/edit/new"
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
    >
      + Novo currículo
    </Link>
  )
}
