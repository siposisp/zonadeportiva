/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*', // Proxy al backend local
      },
    ];
  },
};

export default nextConfig;
