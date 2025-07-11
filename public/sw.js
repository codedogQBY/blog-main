const CACHE_NAME = 'blog-cache-v1'
const STATIC_CACHE = 'static-cache-v1'
const IMAGE_CACHE = 'image-cache-v1'
const API_CACHE = 'api-cache-v1'

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

  // 静态资源缓存策略
  if (request.destination === 'image') {
    event.respondWith(imageStrategy(request))
  }
  // API 请求缓存策略
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiStrategy(request))
  }
  // 页面请求缓存策略
  else if (request.mode === 'navigate') {
    event.respondWith(pageStrategy(request))
  }
  // 其他静态资源
  else {
    event.respondWith(staticStrategy(request))
  }
})

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