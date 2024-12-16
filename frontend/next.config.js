/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3456/api/:path*',
            }
        ];
    },
    api: {
        bodyParser: {
            sizeLimit: '16mb',
        },
        responseLimit: '16mb',
    },
    httpAgentOptions: {
        keepAlive: true,
        timeout: 120000, // 120 seconds to match Flask's timeout
    },
};

module.exports = nextConfig;
