// Service Worker for Blog Performance Optimization
const CACHE_NAME = 'blog-cache-v1.0.0';
const STATIC_CACHE = 'blog-static-v1.0.0';
const DYNAMIC_CACHE = 'blog-dynamic-v1.0.0';
const API_CACHE = 'blog-api-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/blog',
  '/diary',
  '/gallery',
  '/wall',
  '/about',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/logo.png',
  '/dark.png',
  '/light.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// 需要缓存的第三方资源
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
];

// 需要缓存的API路径
const API_PATTERNS = [
  /\/api\/articles/,
  /\/api\/categories/,
  /\/api\/tags/,
  /\/api\/diary/,
  /\/api\/gallery/,
  /\/api\/about/,
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }).catch(error => {
        console.warn('[SW] Failed to cache some static assets:', error);
      }),
      // 缓存外部资源
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching external assets');
        return cache.addAll(EXTERNAL_ASSETS);
      }).catch(error => {
        console.warn('[SW] Failed to cache some external assets:', error);
      }),
      // 立即激活
      self.skipWaiting()
    ])
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即控制所有客户端
      self.clients.claim()
    ])
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非GET请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过chrome扩展等特殊协议
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:') {
    return;
  }
  
  // 处理不同类型的请求
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// 判断是否为静态资源
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.includes(url.pathname) || 
         EXTERNAL_ASSETS.includes(request.url) ||
         url.pathname.startsWith('/_next/static/') ||
         url.pathname.includes('.css') ||
         url.pathname.includes('.js') ||
         url.pathname.includes('.woff') ||
         url.pathname.includes('.woff2');
}

// 判断是否为API请求
function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// 判断是否为图片请求
function isImageRequest(request) {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
}

// 处理静态资源 - 缓存优先策略
async function handleStaticAsset(request) {
  try {
    // 首先尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 缓存未命中，从网络获取
    const networkResponse = await fetch(request);
    
    // 如果请求成功，缓存响应
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error handling static asset:', error);
    // 返回离线页面
    return caches.match('/offline.html');
  }
}

// 处理API请求 - 网络优先策略
async function handleAPIRequest(request) {
  try {
    // 首先尝试从网络获取
    const networkResponse = await fetch(request);
    
    // 如果请求成功，缓存响应
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache...');
    
    // 网络失败，尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 缓存也未命中，返回错误响应
    return new Response(JSON.stringify({ error: 'Offline', message: '网络连接失败，请检查网络设置' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理图片请求 - 缓存优先策略
async function handleImageRequest(request) {
  try {
    // 首先尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 缓存未命中，从网络获取
    const networkResponse = await fetch(request);
    
    // 如果请求成功，缓存响应
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error handling image request:', error);
    // 返回默认图片或错误响应
    return new Response('Image not available', { status: 404 });
  }
}

// 处理动态请求 - 网络优先策略
async function handleDynamicRequest(request) {
  try {
    // 首先尝试从网络获取
    const networkResponse = await fetch(request);
    
    // 如果请求成功且是HTML页面，缓存响应
    if (networkResponse.ok && networkResponse.headers.get('content-type')?.includes('text/html')) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for dynamic request, trying cache...');
    
    // 网络失败，尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 缓存也未命中，返回离线页面
    return caches.match('/offline.html');
  }
}

// 监听消息事件
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_CLEAR') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        const cacheInfo = {
          type: 'CACHE_INFO',
          cacheNames: cacheNames,
          timestamp: Date.now()
        };
        event.ports[0].postMessage(cacheInfo);
      })
    );
  }
});

// 后台同步（如果支持）
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 推送通知（如果支持）
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 后台同步任务
async function doBackgroundSync() {
  console.log('[SW] Performing background sync...');
  // 这里可以添加后台同步逻辑，比如同步离线数据
}

console.log('[SW] Service Worker loaded successfully'); 