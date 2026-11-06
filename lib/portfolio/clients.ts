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
  { id: 'banco-xp', name: 'Banco XP' },
  { id: 'hsbc', name: 'HSBC' },
  { id: 'ambev', name: 'Ambev' },
  { id: 'sinqia', name: 'Sinqia' },
  { id: 'torq', name: 'Torq' },
  { id: 'evertec', name: 'Evertec' },
  { id: 'quanta-previdencia', name: 'Quanta Previdência' },
  { id: 'zema', name: 'Zema' },
  { id: 'robobanker', name: 'RoboBanker' },
  { id: 'toledo-do-brasil', name: 'Toledo do Brasil' },
  { id: 'prix', name: 'Prix' },
  { id: 'ohaus', name: 'Ohaus' },
  { id: 'mettler-toledo', name: 'Mettler Toledo' },
  { id: 'accesstage', name: 'Accesstage' },
  { id: 'veragi', name: 'Veragi' },
  { id: 'new-eon', name: 'New Eon' },
  { id: 'dirhect', name: 'Dirhect' },
]
