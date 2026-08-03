/** Âncora da seção de cases na home (só quando SHOW_HOME_PROJECTS) */
export const PORTFOLIO_PROJECTS_SECTION_ID = 'projetos'

/** Listagem principal de cases (protegida por senha) */
export const PORTFOLIO_PROJECTS_HREF = '/cases'

/** Âncora de um card na listagem (`/cases#projeto-<slug>`) */
export function portfolioCaseAnchorId(slug: string): string {
  return `projeto-${slug}`
}

export function portfolioCaseBackHref(slug: string): string {
  return `${PORTFOLIO_PROJECTS_HREF}#${portfolioCaseAnchorId(slug)}`
}

/** Destino do “voltar” na tela de login de leitor */
export function portfolioLoginBackHref(from?: string): string {
  const caseMatch = from?.match(/^\/cases\/([^/?]+)/)
  if (caseMatch) return portfolioCaseBackHref(caseMatch[1])
  if (from === '/cases' || from?.startsWith('/cases')) return PORTFOLIO_PROJECTS_HREF
  if (from === '/cv' || from?.startsWith('/cv')) return '/'
  return '/'
}
