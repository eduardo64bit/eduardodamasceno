/** Âncora da seção de cases na home pública */
export const PORTFOLIO_PROJECTS_SECTION_ID = 'projetos'

export const PORTFOLIO_PROJECTS_HREF = `/#${PORTFOLIO_PROJECTS_SECTION_ID}`

/** Destino do “voltar” na tela de login de cases */
export function portfolioLoginBackHref(from?: string): string {
  if (from?.startsWith('/cases')) return PORTFOLIO_PROJECTS_HREF
  return '/'
}
