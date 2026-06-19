import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { PortfolioThemeProvider } from '@/components/portfolio/PortfolioThemeProvider'
import { PortfolioSiteFooter } from '@/components/portfolio/PortfolioSiteFooter'
import { PORTFOLIO_THEME_STORAGE_KEY } from '@/lib/portfolio/theme'

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

const themeBootScript = `(function(){try{var k='${PORTFOLIO_THEME_STORAGE_KEY}';var m=localStorage.getItem(k);var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=m==='light'||m==='dark'?m:(dark?'dark':'light');document.documentElement.setAttribute('data-portfolio-theme',t);document.addEventListener('DOMContentLoaded',function(){var r=document.querySelector('.portfolio-theme');if(r)r.setAttribute('data-theme',t);});}catch(e){}})();`

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      <PortfolioThemeProvider className={inter.className}>
        <div className="flex flex-1 flex-col">{children}</div>
        <PortfolioSiteFooter />
      </PortfolioThemeProvider>
    </>
  )
}
