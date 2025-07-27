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
        protocol: 'https',
        hostname: 'image.codeshine.cn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'image.codeshine.cn',
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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 启用图片优化
    unoptimized: false,
  },

  // 编译器优化
  compiler: {
    // 移除 console.log（仅在生产环境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },

  // 实验性功能
  experimental: {
    // 启用优化包大小
    optimizePackageImports: ['lucide-react'],
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
  
  // 减少预加载
  onDemandEntries: {
    // 页面在内存中保持的时间（毫秒）
    maxInactiveAge: 25 * 1000,
    // 同时保持的页面数量
    pagesBufferLength: 2,
  },
  
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
      {
        source: '/rss.xml',
        destination: '/api/rss',
      },
      {
        source: '/feed.xml',
        destination: '/api/rss',
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
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
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