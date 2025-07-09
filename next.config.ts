import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片配置
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
    // 优化图片加载
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // 编译器优化
  compiler: {
    // 移除 console.log（仅在生产环境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },

  // 打包分析（开发时）
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
          openAnalyzer: true,
        })
      )
      return config
    }
  }),

  // 性能优化
  poweredByHeader: false, // 移除 X-Powered-By header
  reactStrictMode: true,
  
  // 生成 sitemap 和 robots.txt
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ]
  },

  // 重定向配置
  async redirects() {
    return [
      // 可以在这里添加重定向规则
    ]
  },

  // Headers 配置用于 SEO 和安全
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
        ],
      },
    ]
  },
};

export default nextConfig; 