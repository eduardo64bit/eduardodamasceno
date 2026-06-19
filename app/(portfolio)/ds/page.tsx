import type { Metadata } from 'next'
import { DesignSystemPage } from '@/components/portfolio/design-system/DesignSystemPage'

export const metadata: Metadata = {
  title: 'Design System — Eduardo Damasceno',
  description: 'Tokens, tipografia, componentes e padrões do portfólio eduardodamasceno.com.br.',
}

export default function DesignSystemRoute() {
  return <DesignSystemPage />
}
