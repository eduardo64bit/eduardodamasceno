import Link from 'next/link'
import { getAllCasesPublic } from '@/lib/domains/cases/queries'

export const dynamic = 'force-dynamic'

export default function CasesAdminPage() {
  const cases = getAllCasesPublic()

  return (
    <div className="min-h-screen">
      <main className="sheet py-8">
        <Link href="/editor" className="text-sm text-gray-500 transition hover:text-gray-800">
          Editor
        </Link>
        <div className="mt-2 mb-6 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Cases ({cases.length})</h1>
          <Link
            href="/editor/cases/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Novo case
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <p className="text-lg">Nenhum case cadastrado.</p>
            <p className="text-sm mt-2">
              <Link href="/editor/cases/new" className="text-blue-600 hover:underline">
                Criar o primeiro
              </Link>{' '}
              ou rode <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">npm run wp:import</code>.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {cases.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-50">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.slug}</p>
                  {c.segments.length > 0 ? (
                    <p className="mt-1 text-xs text-gray-500">{c.segments.join(', ')}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/editor/cases/${c.slug}`}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/portfolio/${c.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-800 underline"
                  >
                    Ver
                  </Link>
                  <span
                    className={`text-xs uppercase tracking-wide ${
                      c.status === 'published' ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
