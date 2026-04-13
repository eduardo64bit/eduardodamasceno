import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body className="font-sans bg-gray-50 text-gray-800 antialiased">
        {children}
      </body>
    </html>
  )
}
