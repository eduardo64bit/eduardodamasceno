/** Âncora da seção de cases na home (só quando SHOW_HOME_PROJECTS) */
export const PORTFOLIO_PROJECTS_SECTION_ID = 'projetos'

/** Listagem principal de cases (protegida por senha) */
export const PORTFOLIO_PROJECTS_HREF = '/portfolio'

/** Âncora de um card na listagem (`/portfolio#projeto-<slug>`) */
export function portfolioCaseAnchorId(slug: string): string {
  return `projeto-${slug}`
}

export function portfolioCaseBackHref(slug: string): string {
  return `${PORTFOLIO_PROJECTS_HREF}#${portfolioCaseAnchorId(slug)}`
}

/** Destino do “voltar” na tela de login de leitor */
export function portfolioLoginBackHref(from?: string): string {
  const caseMatch = from?.match(/^\/portfolio\/([^/?]+)/)
  if (caseMatch) return portfolioCaseBackHref(caseMatch[1])
  if (from === '/portfolio' || from?.startsWith('/portfolio')) {
    return PORTFOLIO_PROJECTS_HREF
  }
  if (from === '/cv' || from?.startsWith('/cv')) return '/'
  return '/'
}
