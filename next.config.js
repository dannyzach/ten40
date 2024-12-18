/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Only enable image optimization if actually using next/image
  images: process.env.ENABLE_IMAGE_OPTIMIZATION === 'true' ? {
    domains: ['localhost'],
  } : {},
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3456/api/:path*'
      }
    ]
  }
};

module.exports = nextConfig; 