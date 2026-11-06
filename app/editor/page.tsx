import Link from 'next/link'

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
    href: '/editor/status',
    title: 'Status',
    description: 'Painel operacional: banco, env, Telegram.',
  },
] as const

export default function EditorHubPage() {
  return (
    <div className="min-h-screen">
      <main className="sheet py-8">
        <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-50">Editor</h1>
        <p className="text-sm text-gray-500 mb-8">
          Conteúdo editável do site: currículo, cases e operação.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm group dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
            >
              <h2 className="font-semibold text-gray-900 transition group-hover:text-blue-700 dark:text-gray-50 dark:group-hover:text-blue-300">
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
