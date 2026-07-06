import type { SiteStatus, ServiceStatus } from '@/lib/domains/status/collector'

const statusLabel: Record<ServiceStatus, string> = {
  ok: 'OK',
  warn: 'Atenção',
  error: 'Erro',
}

const statusClass: Record<ServiceStatus, string> = {
  ok: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  warn: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  error: 'bg-red-500/15 text-red-300 border-red-500/30',
}

interface Props {
  status: SiteStatus
}

export function StatusPage({ status }: Props) {
  const generated = new Date(status.generatedAt).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  })

  return (
    <main className="mx-auto w-full max-w-[48rem] px-6 py-16 sm:px-10 sm:py-24">
      <header className="mb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--pf-muted-3)]">Operações</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--pf-text)] sm:text-4xl">Status</h1>
        <p className="mt-4 text-base text-[var(--pf-muted-2)] leading-relaxed">
          Visão rápida do que está rodando em{' '}
          <span className="text-[var(--pf-muted)]">{status.hostname}</span>.
        </p>
        <p className="mt-2 text-sm text-[var(--pf-muted-3)]">Atualizado em {generated}</p>
      </header>

      <div className="flex flex-col gap-8">
        {status.groups.map((group) => (
          <section
            key={group.id}
            className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] overflow-hidden"
          >
            <h2 className="px-5 py-4 text-sm font-medium uppercase tracking-wide text-[var(--pf-muted)] border-b border-[var(--pf-border)]">
              {group.title}
            </h2>
            <ul className="divide-y divide-[var(--pf-border)]">
              {group.checks.map((check) => (
                <li
                  key={check.id}
                  className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-[var(--pf-text)]">{check.label}</span>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <span
                      className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass[check.status]}`}
                    >
                      {statusLabel[check.status]}
                    </span>
                    <span className="text-sm text-[var(--pf-muted-2)] sm:text-right max-w-md break-words">
                      {check.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-[var(--pf-muted-3)]">
        Recarregue a página para atualizar. Nenhum segredo é exibido aqui.
      </p>
    </main>
  )
}
