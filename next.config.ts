import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3', '@react-pdf/renderer'],
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
}

export default nextConfig
