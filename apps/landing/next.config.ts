import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [],
  images: {
    domains: ['veilprotocol.net'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }
    return config
  },
  // experimental: {
  //   optimizePackageImports: ['framer-motion', 'gsap', 'three'],
  // },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=self' },
        ],
      },
    ]
  },
}

export default nextConfig
