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
        protocol: 'http',
        hostname: 'code-shine.test.upcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'code-shine.test.upcdn.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig; 