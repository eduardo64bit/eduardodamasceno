/** Clientes / empresas — seção "Empresas e marcas:" do portfólio */

export interface PortfolioClient {
  id: string
  name: string
  /** Quando houver logo: /media/clients/{id}.svg (ou .png) */
  logoPath?: string
}

export const portfolioClients: PortfolioClient[] = [
  { id: 'xp-inc', name: 'XP Inc.' },
  { id: 'xp-investimentos', name: 'XP Investimentos' },
  { id: 'xp-empresas', name: 'XP Empresas' },
  { id: 'hub', name: 'HUB' },
  { id: 'hsbc', name: 'HSBC' },
  { id: 'quanta-previdencia', name: 'Quanta Previdência' },
  { id: 'sinqia', name: 'Sinqia' },
  { id: 'torq', name: 'Torq' },
  { id: 'evertec', name: 'Evertec' },
  { id: 'zema', name: 'Zema' },
  { id: 'robobanker', name: 'Robobanker' },
  { id: 'ambev', name: 'Ambev' },
  { id: 'toledo-do-brasil', name: 'Toledo do Brasil' },
  { id: 'prix', name: 'Prix' },
  { id: 'ohaus', name: 'Ohaus' },
  { id: 'mettler-toledo', name: 'Mettler Toledo' },
]
