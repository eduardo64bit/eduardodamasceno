import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { PortfolioThemeProvider } from '@/components/portfolio/PortfolioThemeProvider'
import { PortfolioSiteFooter } from '@/components/portfolio/PortfolioSiteFooter'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Eduardo Damasceno — Designer de Produto',
  description:
    'Portfólio de design de produto — plataformas financeiras, produtos B2B e sistemas complexos.',
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortfolioThemeProvider className={inter.className}>
      <div className="flex flex-1 flex-col">{children}</div>
      <PortfolioSiteFooter />
    </PortfolioThemeProvider>
  )
}
