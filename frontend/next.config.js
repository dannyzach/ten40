/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3456/api/:path*',
                basePath: false
            }
        ];
    },
    experimental: {
        proxyTimeout: 120000
    }
};

module.exports = nextConfig;
