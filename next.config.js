/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Only enable image optimization if actually using next/image
  images: process.env.ENABLE_IMAGE_OPTIMIZATION === 'true' ? {
    domains: ['localhost'],
  } : {},
};

module.exports = nextConfig; 