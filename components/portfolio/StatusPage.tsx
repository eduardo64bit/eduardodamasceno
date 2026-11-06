import type { SiteStatus, ServiceStatus } from '@/lib/domains/status/collector'

const statusLabel: Record<ServiceStatus, string> = {
  ok: 'OK',
  warn: 'Atenção',
  error: 'Erro',
}

const statusClass: Record<ServiceStatus, string> = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
  warn: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300',
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
    <main className="sheet py-5">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Status</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {status.hostname} · {generated}
        </p>
      </header>

      <div className="flex flex-col gap-2.5">
        {status.groups.map((group) => (
          <section
            key={group.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="border-b border-gray-200 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {group.title}
            </h2>
            <ul>
              {group.checks.map((check) => (
                <li
                  key={check.id}
                  className="flex items-center gap-3 border-t border-gray-100 px-3 py-1.5 first:border-t-0 dark:border-gray-700"
                >
                  <span className="shrink-0 text-sm text-gray-900 dark:text-gray-100">
                    {check.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-gray-400">
                    {check.detail}
                  </span>
                  <span
                    className={`inline-flex shrink-0 rounded-full border px-2 py-px text-[11px] font-medium leading-4 ${statusClass[check.status]}`}
                  >
                    {statusLabel[check.status]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Recarregue a página para atualizar. Nenhum segredo é exibido aqui.
      </p>
    </main>
  )
}
