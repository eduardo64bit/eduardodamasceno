import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3', '@react-pdf/renderer'],
  outputFileTracingIncludes: {
    '/cv/pdf': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
    '/editor/cv/[id]/pdf': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
  },
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
}

export default nextConfig
