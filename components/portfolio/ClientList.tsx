import type { PortfolioClient } from '@/lib/portfolio/clients'

interface Props {
  clients: PortfolioClient[]
}

export function ClientList({ clients }: Props) {
  return (
    <ul className="flex flex-wrap items-center gap-x-8 gap-y-5 sm:gap-x-10 sm:gap-y-6 text-left">
      {clients.map((client) => (
        <li key={client.id}>
          {client.logoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={client.logoPath}
              alt={client.name}
              className="h-8 sm:h-9 w-auto max-w-[9rem] object-contain object-left opacity-70 hover:opacity-100 transition-opacity"
            />
          ) : (
            <span className="text-base sm:text-lg font-light text-[var(--pf-muted-3)] hover:text-[var(--pf-muted-2)] transition-colors">
              {client.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
