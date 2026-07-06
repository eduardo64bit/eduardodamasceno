export const CASE_SEGMENT_IDS = [
  'financeiros',
  'industria',
  'plataformas',
  'autorais',
] as const

export type CaseSegmentId = (typeof CASE_SEGMENT_IDS)[number]

export const CASE_SEGMENTS: ReadonlyArray<{ id: CaseSegmentId; label: string }> = [
  { id: 'financeiros', label: 'Financeiros' },
  { id: 'industria', label: 'Indústria' },
  { id: 'plataformas', label: 'Plataformas' },
  { id: 'autorais', label: 'Autorais' },
]

const SEGMENT_SET = new Set<string>(CASE_SEGMENT_IDS)

export function isCaseSegmentId(value: string): value is CaseSegmentId {
  return SEGMENT_SET.has(value)
}

export function parseCaseSegments(raw: string | null | undefined): CaseSegmentId[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is CaseSegmentId => typeof item === 'string' && isCaseSegmentId(item))
  } catch {
    return []
  }
}

export function serializeCaseSegments(segments: readonly CaseSegmentId[]): string {
  return JSON.stringify([...new Set(segments)])
}
