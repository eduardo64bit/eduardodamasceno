'use client'

import { useMemo, useState } from 'react'
import type { CasePublic } from '@/lib/domains/cases/types'
import { CASE_SEGMENTS, type CaseSegmentId } from '@/lib/domains/cases/segments'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { CaseCard } from './CaseCard'

const chipClass =
  'pf-filter-chip rounded-full px-4 py-2 text-sm font-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pf-text)]'

function filterCases(cases: CasePublic[], selected: ReadonlySet<CaseSegmentId>): CasePublic[] {
  if (selected.size === 0) return cases
  return cases.filter((item) => item.segments.some((segment) => selected.has(segment)))
}

interface Props {
  cases: CasePublic[]
}

export function CaseProjectsSection({ cases }: Props) {
  const [selected, setSelected] = useState<ReadonlySet<CaseSegmentId>>(() => new Set())

  const showAll = selected.size === 0
  const filteredCases = useMemo(() => filterCases(cases, selected), [cases, selected])

  const selectAll = () => setSelected(new Set())

  const toggleSegment = (segment: CaseSegmentId) => {
    setSelected((prev) => {
      if (prev.size === 0) {
        return new Set([segment])
      }

      const next = new Set(prev)
      if (next.has(segment)) next.delete(segment)
      else next.add(segment)
      return next
    })
  }

  return (
    <>
      <div
        className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        role="group"
        aria-label={portfolioLabels.caseSegmentFilter}
      >
        <button
          type="button"
          aria-pressed={showAll}
          onClick={selectAll}
          className={chipClass}
        >
          {portfolioLabels.caseSegmentAll}
        </button>

        {CASE_SEGMENTS.map(({ id, label }) => {
          const active = !showAll && selected.has(id)
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleSegment(id)}
              className={chipClass}
            >
              {label}
            </button>
          )
        })}
      </div>

      {filteredCases.length === 0 ? (
        <p className="text-center text-[var(--pf-muted-3)] text-sm">{portfolioLabels.noCasesFiltered}</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredCases.map((caseItem, i) => (
            <li key={caseItem.id}>
              <CaseCard caseItem={caseItem} revealDelay={(i % 4) * 0.05} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
