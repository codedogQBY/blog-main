// Service Worker 缓存策略配置
export const SW_CONFIG = {
  // 缓存版本 - 修改这个版本号会清空所有缓存
  CACHE_VERSION: 'v6',
  
  // 缓存策略配置
  STRATEGY: {
    // 网络优先 - 优先从网络获取，失败时使用缓存
    NETWORK_FIRST: 'network-first',
    // 缓存优先 - 优先从缓存获取，没有缓存时从网络获取
    CACHE_FIRST: 'cache-first',
    // 仅网络 - 只从网络获取，不使用缓存
    NETWORK_ONLY: 'network-only',
    // 仅缓存 - 只从缓存获取，不访问网络
    CACHE_ONLY: 'cache-only'
  },
  
  // 资源类型策略配置
  RESOURCE_STRATEGIES: {
    // 所有API数据请求 - 网络优先
    API_DATA: 'network-first',
    // 页面HTML - 网络优先  
    PAGES: 'network-first',
    // Next.js数据 - 网络优先
    NEXTJS_DATA: 'network-first',
    // 所有其他数据请求 - 网络优先
    FETCH_REQUESTS: 'network-first',
    // 图片资源 - 缓存优先（减少带宽使用）
    IMAGES: 'cache-first',
    // CSS/JS等静态资源 - 缓存优先（提高性能）
    STATIC_ASSETS: 'cache-first'
  },
  
  // API域名配置 - 用于识别API请求
  API_DOMAINS: [
    'localhost:3001',
    'api.codeshine.cn', // 生产环境API域名
    // 添加更多API域名...
  ],
  
  // 需要网络优先的路径模式
  NETWORK_FIRST_PATTERNS: [
    '/api/',
    '/interactions/',
    '/sticky-notes',
    '/diary',
    '/gallery',
    '/search',
    '/system-config',
    '/logs/',
    '/_next/data/' // Next.js数据请求
  ],
  
  // 静态资源缓存时间配置（秒）
  CACHE_DURATIONS: {
    // API数据缓存时间
    API: 300, // 5分钟
    // 图片缓存时间  
    IMAGES: 86400, // 24小时
    // 静态资源缓存时间
    STATIC: 2592000, // 30天
    // 页面缓存时间
    PAGES: 3600 // 1小时
  },
  
  // 网络超时配置（毫秒）
  TIMEOUTS: {
    // API请求超时
    API: 8000,
    // 页面请求超时
    PAGES: 5000,
    // 图片请求超时
    IMAGES: 10000
  },
  
  // 缓存存储配置
  CACHE_STORAGE: {
    // 最大缓存条目数
    MAX_ENTRIES: {
      API: 100,
      IMAGES: 200,
      STATIC: 50,
      PAGES: 30
    },
    // 最大缓存大小（字节）
    MAX_SIZE: {
      API: 10 * 1024 * 1024, // 10MB
      IMAGES: 50 * 1024 * 1024, // 50MB  
      STATIC: 20 * 1024 * 1024, // 20MB
      PAGES: 5 * 1024 * 1024 // 5MB
    }
  },
  
  // 调试配置
  DEBUG: {
    // 是否启用详细日志
    VERBOSE_LOGGING: false,
    // 是否在控制台显示缓存命中/未命中
    LOG_CACHE_HITS: false,
    // 是否记录网络请求性能
    LOG_PERFORMANCE: false
  }
}

// 辅助函数 - 检查是否为API请求
export function isApiRequest(url: URL): boolean {
  return SW_CONFIG.API_DOMAINS.some(domain => url.host.includes(domain)) ||
         SW_CONFIG.NETWORK_FIRST_PATTERNS.some(pattern => url.pathname.includes(pattern))
}

// 辅助函数 - 检查是否为Next.js数据请求
export function isNextJSDataRequest(url: URL): boolean {
  return url.search.includes('__nextDataReq') || 
         url.pathname.includes('/_next/data/')
}

// 辅助函数 - 检查是否为图片请求
export function isImageRequest(request: Request, url: URL): boolean {
  return request.destination === 'image' || 
         url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i) !== null
}

// 辅助函数 - 检查是否为静态资源请求  
export function isStaticAssetRequest(url: URL): boolean {
  return url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i) !== null
}

// 辅助函数 - 获取请求类型
export function getRequestType(request: Request, url: URL): string {
  if (isApiRequest(url)) return 'API_DATA'
  if (isNextJSDataRequest(url)) return 'NEXTJS_DATA'
  if (isImageRequest(request, url)) return 'IMAGES'
  if (isStaticAssetRequest(url)) return 'STATIC_ASSETS'
  if (request.mode === 'navigate' || request.destination === 'document') return 'PAGES'
  return 'FETCH_REQUESTS'
}

// 辅助函数 - 获取缓存策略
export function getCacheStrategy(requestType: string): string {
  return SW_CONFIG.RESOURCE_STRATEGIES[requestType as keyof typeof SW_CONFIG.RESOURCE_STRATEGIES] || 'network-first'
} 