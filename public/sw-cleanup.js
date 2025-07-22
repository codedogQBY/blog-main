// Service Worker 清理文件
// 这个文件用于清理旧的 Service Worker 并移除所有缓存

self.addEventListener('install', function(event) {
  console.log('SW清理: 开始安装清理Service Worker');
  // 跳过等待，立即激活
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  console.log('SW清理: 开始激活清理Service Worker');
  
  event.waitUntil(
    Promise.all([
      // 清理所有缓存
      caches.keys().then(function(cacheNames) {
        console.log('SW清理: 找到缓存:', cacheNames);
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('SW清理: 删除缓存:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // 声明控制所有客户端
      self.clients.claim()
    ])
  );
});

// 拦截所有fetch请求，不进行任何缓存
self.addEventListener('fetch', function(event) {
  // 直接通过网络获取，不使用缓存
  event.respondWith(fetch(event.request));
});

// 监听消息，执行注销操作
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'UNREGISTER') {
    console.log('SW清理: 收到注销请求');
    // 注销自己
    self.registration.unregister().then(function(boolean) {
      console.log('SW清理: 注销结果:', boolean);
      // 通知客户端注销完成
      event.ports[0].postMessage({ success: boolean });
    });
  }
});

console.log('SW清理: Service Worker 清理脚本已加载'); 