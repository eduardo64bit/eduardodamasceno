import { LoginForm } from '@/components/editor/LoginForm'

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function EditorLoginPage({ searchParams }: Props) {
  const { from } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão do portfólio</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <LoginForm from={from} />
        </div>
      </div>
    </main>
  )
}
