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
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://backend-production-711f.up.railway.app/api/:path*'
          : 'http://localhost:3456/api/:path*',
      }
    ];
  }
};

module.exports = nextConfig; 