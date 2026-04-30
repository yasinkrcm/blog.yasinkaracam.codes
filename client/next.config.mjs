import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.yasinkaracam.codes',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'apiblog.yasinkaracam.codes',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'apiblog.yasinkaracam.codes',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
