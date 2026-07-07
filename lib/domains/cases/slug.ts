/** Gera slug URL-safe a partir do título. */
export function slugifyCaseTitle(title: string): string {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return base || 'case'
}

export function ensureUniqueCaseSlug(
  base: string,
  exists: (slug: string) => boolean
): string {
  if (!exists(base)) return base
  let n = 2
  while (exists(`${base}-${n}`)) n++
  return `${base}-${n}`
}
