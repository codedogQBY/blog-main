// Service Worker 注册和管理工具

// Service Worker 配置
const SW_CONFIG = {
  scriptURL: '/sw.js',
  scope: '/',
  updateInterval: 24 * 60 * 60 * 1000, // 24小时检查更新
};

// 检查浏览器是否支持 Service Worker
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

// 注册 Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.warn('[SW] Service Worker not supported');
    return null;
  }

  try {
    console.log('[SW] Registering Service Worker...');
    
    const registration = await navigator.serviceWorker.register(
      SW_CONFIG.scriptURL,
      { scope: SW_CONFIG.scope }
    );

    console.log('[SW] Service Worker registered successfully:', registration);

    // 监听 Service Worker 更新
    registration.addEventListener('updatefound', () => {
      console.log('[SW] Service Worker update found');
      
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New Service Worker installed, ready to activate');
            // 可以在这里显示更新提示
            showUpdateNotification();
          }
        });
      }
    });

    // 监听 Service Worker 控制变化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Service Worker controller changed');
      // 页面刷新以确保使用新的 Service Worker
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
    return null;
  }
}

// 注销 Service Worker
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('[SW] Service Worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('[SW] Service Worker unregistration failed:', error);
    return false;
  }
}

// 检查 Service Worker 更新
export async function checkForUpdates(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.update();
      console.log('[SW] Checking for updates...');
    }
  } catch (error) {
    console.error('[SW] Update check failed:', error);
  }
}

// 清理缓存
export async function clearCache(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    // 发送清理缓存消息给 Service Worker
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      registration.active.postMessage({ type: 'CACHE_CLEAR' });
    }

    // 直接清理浏览器缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    console.log('[SW] Cache cleared successfully');
  } catch (error) {
    console.error('[SW] Cache clearing failed:', error);
  }
}

// 获取缓存信息
export async function getCacheInfo(): Promise<{
  cacheNames: string[];
  totalSize: number;
}> {
  if (!isServiceWorkerSupported() || !('caches' in window)) {
    return { cacheNames: [], totalSize: 0 };
  }

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return { cacheNames, totalSize };
  } catch (error) {
    console.error('[SW] Failed to get cache info:', error);
    return { cacheNames: [], totalSize: 0 };
  }
}

// 显示更新通知
function showUpdateNotification(): void {
  // 创建更新提示元素
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <span>🔄 有新版本可用</span>
      <button onclick="window.location.reload()" class="bg-white text-blue-500 px-2 py-1 rounded text-sm">
        刷新
      </button>
      <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
        ✕
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // 5秒后自动移除
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// 初始化 Service Worker
export async function initServiceWorker(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return;
  }

  // 注册 Service Worker
  await registerServiceWorker();

  // 定期检查更新
  setInterval(checkForUpdates, SW_CONFIG.updateInterval);

  // 页面可见性变化时检查更新
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkForUpdates();
    }
  });

  console.log('[SW] Service Worker initialized');
}

// 导出 Service Worker 状态检查函数
export function getServiceWorkerStatus(): {
  supported: boolean;
  registered: boolean;
  controlled: boolean;
} {
  const supported = isServiceWorkerSupported();
  const registered = supported && !!navigator.serviceWorker.controller;
  const controlled = supported && !!navigator.serviceWorker.controller;

  return {
    supported,
    registered,
    controlled,
  };
} 