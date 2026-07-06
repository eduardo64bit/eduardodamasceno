import Link from 'next/link'
import { getAllCasesPublic } from '@/lib/domains/cases/queries'

export const dynamic = 'force-dynamic'

export default function CasesAdminPage() {
  const cases = getAllCasesPublic()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/cvmkr/dashboard" className="text-gray-400 hover:text-gray-800 transition">
              ← Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Cases</span>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition">
            Ver portfólio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Cases ({cases.length})
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Editor completo e importação WordPress na próxima fase. Por ora, lista e preview
          público em <Link href="/" className="underline">eduardodamasceno.com.br</Link>.
        </p>

        {cases.length === 0 ? (
          <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <p className="text-lg">Nenhum case cadastrado.</p>
            <p className="text-sm mt-2">
              Rode <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">node scripts/wp-inventory.mjs</code>{' '}
              para inventariar o WordPress.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {cases.map((c) => (
              <li
                key={c.id}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.slug}</p>
                  {c.segments.length > 0 ? (
                    <p className="mt-1 text-xs text-gray-500">{c.segments.join(', ')}</p>
                  ) : null}
                </div>
                <span className="text-xs uppercase tracking-wide text-gray-400">{c.status}</span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
