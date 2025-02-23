/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone',
    // Disable ESLint during build
    eslint: {
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        // Keep local development working with localhost:3456
        return process.env.NODE_ENV === 'production' ? [] : [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3456/api/:path*',
            }
        ];
    },
    // Keep both local and production image domains
    images: {
        domains: [
            'backend-production-711f.up.railway.app',
            'localhost',
            'your-backend-url.vercel.app'
        ],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
