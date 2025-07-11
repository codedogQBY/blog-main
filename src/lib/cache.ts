// API 缓存配置
export const CACHE_TAGS = {
  ARTICLES: 'articles',
  ARTICLE: 'article',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  COMMENTS: 'comments',
} as const

export const CACHE_DURATIONS = {
  ARTICLES: 60 * 5, // 5分钟
  ARTICLE: 60 * 10, // 10分钟
  CATEGORIES: 60 * 30, // 30分钟
  TAGS: 60 * 30, // 30分钟
  COMMENTS: 60 * 1, // 1分钟
} as const

// 客户端缓存配置
interface CacheConfig {
  maxAge: number
  staleWhileRevalidate: number
}

export const CLIENT_CACHE: Record<string, CacheConfig> = {
  articles: {
    maxAge: 300, // 5分钟
    staleWhileRevalidate: 600, // 10分钟
  },
  images: {
    maxAge: 86400, // 24小时
    staleWhileRevalidate: 604800, // 7天
  },
  static: {
    maxAge: 2592000, // 30天
    staleWhileRevalidate: 31536000, // 1年
  },
}

// SWR 配置
export const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  loadingTimeout: 3000,
  errorRetryInterval: 5000,
  errorRetryCount: 3,
  fallbackData: null,
  suspense: false,
  keepPreviousData: true,
}