import { LoginForm } from '@/components/cvmkr/LoginForm'

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { from } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">CVMKR</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de Currículos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <LoginForm from={from} />
        </div>
      </div>
    </main>
  )
}
