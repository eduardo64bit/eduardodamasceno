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
      {/* Anti-FOUC: apply saved theme before React hydrates */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');})()`,
          }}
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
