import Link from 'next/link'
import { PortfolioLoginForm } from '@/components/portfolio/PortfolioLoginForm'

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function PortfolioLoginPage({ searchParams }: Props) {
  const { from } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center px-6 sm:px-10 py-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--pf-muted-3)] mb-3">
            Acesso restrito
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--pf-text)]">
            Portfólio confidencial
          </h1>
          <p className="text-sm text-[var(--pf-muted-2)] mt-3 leading-relaxed">
            Este conteúdo é protegido. Informe a senha para continuar.
          </p>
        </div>

        <PortfolioLoginForm from={from} />

        <p className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--pf-muted-3)] hover:text-[var(--pf-text)] transition"
          >
            ← Voltar ao portfólio
          </Link>
        </p>
      </div>
    </main>
  )
}
