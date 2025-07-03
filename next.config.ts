import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'beal-blog-main.test.upcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'beal-blog-main.test.upcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'huohuo90.com',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig; 