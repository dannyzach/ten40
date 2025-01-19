/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
            'localhost'
        ],
    }
};

module.exports = nextConfig;
