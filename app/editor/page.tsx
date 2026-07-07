import Link from 'next/link'
import { EditorHeader } from '@/components/editor/EditorHeader'
import { logoutAction } from './actions'

const sections = [
  {
    href: '/editor/cv',
    title: 'Currículos',
    description: 'Editar CV público, versões e currículo ativo.',
  },
  {
    href: '/editor/cases',
    title: 'Cases',
    description: 'Listar e editar projetos do portfólio.',
  },
  {
    href: '/status',
    title: 'Status',
    description: 'Painel operacional — banco, env, Telegram.',
  },
] as const

export default function EditorHubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EditorHeader
        title="Painel"
        trailing={
          <>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition">
              Ver site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-800 transition"
              >
                Sair
              </button>
            </form>
          </>
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">O que editar</h1>
        <p className="text-sm text-gray-500 mb-8">
          Conteúdo editável do site — currículo, cases e operação.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition group"
            >
              <h2 className="font-semibold text-gray-900 group-hover:text-blue-700 transition">
                {section.title}
              </h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{section.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
