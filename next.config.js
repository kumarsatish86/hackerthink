/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  // Use standalone output
  output: 'standalone',
  experimental: {
    // Remove serverExternalPackages as it's not supported in Next.js 15.3.2
  },
  // Image configuration for local uploads
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3007',
        pathname: '/uploads/**',
      },
    ],
  },
  // Disable static generation for problematic pages
  excludeDefaultMomentLocales: true,
  generateBuildId: async () => {
    return 'hackerthink-build-' + Date.now()
  },
  // Simplified webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Handle cloudflare:sockets - must be a complete mock
    config.resolve.alias = {
      ...config.resolve.alias,
      'cloudflare:sockets': path.join(__dirname, 'src/lib/empty-module.js')
    };
    
    // Configure node polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      dns: false,
      path: false,
      stream: false,
      string_decoder: false,
      crypto: false,
      util: false,
      constants: false,
      assert: false,
      events: false,
      url: false,
      querystring: false,
      buffer: false,
      process: false,
      zlib: false,
      os: false,
    };
    
    return config;
  },
  // Add empty turbopack config to silence the error in Next.js 16
  // The webpack config is still needed for compatibility
  turbopack: {},
  // Note: serverRuntimeConfig and publicRuntimeConfig have been removed in Next.js 16
  // Use environment variables directly via process.env instead
};

module.exports = nextConfig; 