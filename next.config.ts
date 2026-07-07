import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  async redirects() {
    return [
      {
        source: '/cases',
        destination: '/?section=projetos',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
