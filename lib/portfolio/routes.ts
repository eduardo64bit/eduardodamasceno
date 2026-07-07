/** Âncora da seção de cases na home pública */
export const PORTFOLIO_PROJECTS_SECTION_ID = 'projetos'

export const PORTFOLIO_PROJECTS_HREF = `/#${PORTFOLIO_PROJECTS_SECTION_ID}`

/** Âncora de um card de projeto na home (`/#projeto-<slug>`) */
export function portfolioCaseAnchorId(slug: string): string {
  return `projeto-${slug}`
}

export function portfolioCaseBackHref(slug: string): string {
  return `/#${portfolioCaseAnchorId(slug)}`
}

/** Destino do “voltar” na tela de login de cases */
export function portfolioLoginBackHref(from?: string): string {
  const caseMatch = from?.match(/^\/cases\/([^/?]+)/)
  if (caseMatch) return portfolioCaseBackHref(caseMatch[1])
  if (from?.startsWith('/cases')) return PORTFOLIO_PROJECTS_HREF
  return '/'
}
