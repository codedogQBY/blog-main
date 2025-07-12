const CACHE_NAME = 'blog-cache-v5'
const STATIC_CACHE = 'static-cache-v5'
const IMAGE_CACHE = 'image-cache-v5'
const API_CACHE = 'api-cache-v5'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// 安装阶段
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// 激活阶段
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// 请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 跳过非GET请求和chrome-extension等非HTTP请求
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return
  }

  // 获取API域名配置
  const apiDomains = [
    'localhost:3001',
    'your-api-domain.com', // 替换为你的实际API域名
  ]
  
  // 检查是否是API请求（基于域名和路径）
  const isApiRequest = apiDomains.some(domain => url.host.includes(domain)) ||
                      url.pathname.startsWith('/api/') ||
                      url.pathname.includes('/interactions/') ||
                      url.pathname.includes('/sticky-notes') ||
                      url.pathname.includes('/diary') ||
                      url.pathname.includes('/gallery') ||
                      url.pathname.includes('/search') ||
                      url.pathname.includes('/system-config') ||
                      url.pathname.includes('/logs/')

  // API 请求 - 网络优先但保存缓存，断网时使用缓存
  if (isApiRequest) {
    event.respondWith(networkFirstWithCacheStrategy(request))
  }
  // Next.js 数据请求 - 网络优先但保存缓存
  else if (url.search.includes('__nextDataReq') || 
           url.pathname.includes('/_next/data/')) {
    event.respondWith(networkFirstWithCacheStrategy(request))
  }
  // 图片缓存策略 - Cache First
  else if (request.destination === 'image' || 
           url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    event.respondWith(imageStrategy(request))
  }
  // 页面导航请求 - Network First (保持页面缓存)
  else if (request.mode === 'navigate') {
    event.respondWith(pageStrategy(request))
  }
  // CSS/JS 等静态资源 - Cache First (同源的静态资源)
  else if (url.origin === self.location.origin && 
           url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i)) {
    event.respondWith(staticStrategy(request))
  }
  // 其他 Next.js 动态资源 - 网络优先但保存缓存
  else if (url.origin === self.location.origin && url.pathname.startsWith('/_next/')) {
    event.respondWith(networkFirstWithCacheStrategy(request))
  }
})

// 网络优先但保存缓存策略 - 网络正常时保存缓存，断网时使用缓存
async function networkFirstWithCacheStrategy(request) {
  const cache = await caches.open(API_CACHE)
  
  try {
    const response = await fetch(request)
    
    // 网络请求成功，保存到缓存（只缓存成功的GET请求）
    if (response.ok && request.method === 'GET') {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.error('Network request failed, trying cache fallback:', error)
    
    // 网络失败时，尝试从缓存中获取数据
    const cached = await cache.match(request)
    
    if (cached) {
      console.log('Serving from cache due to network failure:', request.url)
      // 为缓存响应添加一个标识头，让前端知道这是缓存数据
      const cachedResponse = cached.clone()
      cachedResponse.headers.set('X-Served-From-Cache', 'true')
      return cachedResponse
    }
    
    // 如果缓存中也没有，返回网络错误
    return new Response('Network Error - No cache available', { 
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// 图片缓存策略 - Cache First
async function imageStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('Image fetch failed:', error)
    return new Response('Image not available', { status: 404 })
  }
}

// API 缓存策略 - Network First with 5s timeout
async function apiStrategy(request) {
  const cache = await caches.open(API_CACHE)
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(request, { 
      signal: controller.signal 
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.warn('API request failed, trying cache:', error)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

// 页面缓存策略 - Network First
async function pageStrategy(request) {
  const cache = await caches.open(STATIC_CACHE)
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    
    // 返回离线页面
    return cache.match('/offline') || new Response('Offline', { status: 503 })
  }
}

// 静态资源缓存策略 - Cache First
async function staticStrategy(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('Static resource fetch failed:', error)
    throw error
  }
}