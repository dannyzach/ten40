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
        proxyTimeout: 300000, // 5 minutes
        largePageDataBytes: 128 * 100000
    },
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            punycode: false,
            util: false
        };
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300
        };
        return config;
    },
    httpAgentOptions: {
        keepAlive: true
    }
};

module.exports = nextConfig;
