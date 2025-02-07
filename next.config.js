/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Only enable image optimization if actually using next/image
  images: process.env.ENABLE_IMAGE_OPTIMIZATION === 'true' ? {
    domains: [
      'localhost',
      'backend-production-711f.up.railway.app'
    ],
  } : {},
  async rewrites() {
    // Keep local development working with localhost:3456
    return process.env.NODE_ENV === 'production' ? [] : [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3456/api/:path*',
      }
    ];
  }
};

module.exports = nextConfig; 