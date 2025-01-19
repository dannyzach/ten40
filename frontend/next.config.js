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
    },
    // These are needed for local development
    api: {
        bodyParser: {
            sizeLimit: '16mb',
        },
        responseLimit: '16mb',
    },
};

module.exports = nextConfig;
