import Link from 'next/link'
import type { CasePublic } from '@/lib/domains/cases/types'
import { RevealOnScroll } from './motion/RevealOnScroll'

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 42 42" fill="none" aria-hidden>
      <path
        d="M15.4 27L14 25.6L23.6 16H15V14H27V26H25V17.4L15.4 27Z"
        fill="currentColor"
      />
    </svg>
  )
}

interface Props {
  caseItem: CasePublic
  revealDelay?: number
}

export function CaseCard({ caseItem, revealDelay = 0 }: Props) {
  return (
    <RevealOnScroll delay={revealDelay} y={32}>
      <Link
        href={`/cases/${caseItem.slug}`}
        className="group block rounded-xl overflow-hidden bg-[var(--pf-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pf-text)]"
        aria-label={caseItem.title}
      >
        <div className="relative aspect-video overflow-hidden bg-[var(--pf-surface-2)]">
          {caseItem.cover_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={caseItem.cover_path}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--pf-muted-3)] text-xs">
              Sem capa
            </div>
          )}

          {/* Título aparece no hover / foco — overlay + slide up */}
          <div
            className="absolute inset-0 bg-[var(--pf-overlay)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <div className="flex items-end justify-between gap-2">
              <p className="text-sm sm:text-base font-medium text-white leading-snug line-clamp-3">
                {caseItem.title}
              </p>
              <span className="shrink-0 text-white/90">
                <ArrowIcon />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </RevealOnScroll>
  )
}
