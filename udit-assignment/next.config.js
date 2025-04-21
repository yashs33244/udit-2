/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  env: {
    MONGODB_BE_URL: process.env.MONGODB_BE_URL || 'http://localhost:5001',
    NEXT_PUBLIC_MONGODB_BE_URL: process.env.NEXT_PUBLIC_MONGODB_BE_URL || 'http://localhost:5001',
  },
  eslint: {
    // This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  experimental: {
    // Useful for debugging
    logging: {
      level: 'verbose'
    }
  },
}

module.exports = nextConfig 