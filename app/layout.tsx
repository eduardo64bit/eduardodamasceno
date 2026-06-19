import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { PORTFOLIO_THEME_BOOT_SCRIPT, PORTFOLIO_THEME_DARK_BG } from '@/lib/portfolio/theme'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  title: 'Eduardo Damasceno — Designer de Produto',
  description:
    'Designer de Produto especializado em UX/UI, inovação e estratégia.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: PORTFOLIO_THEME_DARK_BG,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={manrope.variable} suppressHydrationWarning>
      {/* Anti-FOUC: apply saved theme before React hydrates */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: PORTFOLIO_THEME_BOOT_SCRIPT,
          }}
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-gray-800 antialiased">
        {children}
      </body>
    </html>
  )
}
