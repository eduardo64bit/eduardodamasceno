import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow Vercel deployment without ESLint/TS build errors blocking CI
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
}

export default nextConfig
