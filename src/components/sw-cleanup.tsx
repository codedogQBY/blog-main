'use client';

import { useEffect } from 'react';

export function ServiceWorkerCleanup() {
  useEffect(() => {
    // 只在支持Service Worker的浏览器中执行
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // 检查是否已经清理过，避免重复执行
      const hasCleanedUp = localStorage.getItem('sw-cleanup-completed');
      const lastCleanup = hasCleanedUp ? parseInt(hasCleanedUp) : 0;
      const oneDay = 24 * 60 * 60 * 1000; // 24小时
      
      // 如果超过24小时或从未清理过，则执行清理
      if (!hasCleanedUp || (Date.now() - lastCleanup) > oneDay) {
        cleanupServiceWorker();
      }
    }
  }, []);

  const cleanupServiceWorker = async () => {
    try {
      console.log('开始清理Service Worker...');

      // 1. 获取所有已注册的Service Worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('找到的Service Worker注册:', registrations.length);

      if (registrations.length === 0) {
        console.log('没有找到已注册的Service Worker');
        return;
      }

      // 2. 首先注册清理用的Service Worker
      let cleanupRegistration: ServiceWorkerRegistration | undefined;
      try {
        cleanupRegistration = await navigator.serviceWorker.register('/sw-cleanup.js', {
          scope: '/'
        });
        console.log('清理Service Worker注册成功');

        // 等待清理SW激活
        if (cleanupRegistration && cleanupRegistration.installing) {
          await new Promise((resolve) => {
            cleanupRegistration!.installing!.addEventListener('statechange', () => {
              if (cleanupRegistration!.installing!.state === 'activated') {
                resolve(void 0);
              }
            });
          });
        }

        // 等待一段时间让清理SW完成缓存清理
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. 向清理SW发送注销消息
        if (cleanupRegistration && cleanupRegistration.active) {
          const channel = new MessageChannel();
          const unregisterPromise = new Promise((resolve) => {
            channel.port1.onmessage = (event) => {
              console.log('收到清理SW的注销响应:', event.data);
              resolve(event.data.success);
            };
          });

          cleanupRegistration.active.postMessage(
            { type: 'UNREGISTER' },
            [channel.port2]
          );

          await unregisterPromise;
        }
      } catch (error) {
        console.warn('注册清理Service Worker失败:', error);
      }

      // 4. 注销所有Service Worker（包括清理SW）
      const unregisterPromises = registrations.map(async (registration) => {
        try {
          const success = await registration.unregister();
          console.log(`注销Service Worker ${registration.scope}:`, success);
          return success;
        } catch (error) {
          console.warn(`注销Service Worker ${registration.scope} 失败:`, error);
          return false;
        }
      });

      await Promise.all(unregisterPromises);

      // 5. 手动清理所有缓存存储
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          console.log('找到的缓存:', cacheNames);
          
          const deletePromises = cacheNames.map(async (cacheName) => {
            try {
              const deleted = await caches.delete(cacheName);
              console.log(`删除缓存 ${cacheName}:`, deleted);
              return deleted;
            } catch (error) {
              console.warn(`删除缓存 ${cacheName} 失败:`, error);
              return false;
            }
          });

          await Promise.all(deletePromises);
        } catch (error) {
          console.warn('清理缓存失败:', error);
        }
      }

      // 6. 清理localStorage中的SW相关数据
      try {
        const swKeys = [
          'sw-version',
          'sw-cache-version',
          'workbox-runtime',
          'workbox-precache',
          // 添加其他可能的SW相关key
        ];

        swKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`清理localStorage: ${key}`);
          }
        });
      } catch (error) {
        console.warn('清理localStorage失败:', error);
      }

      // 7. 清理sessionStorage中的SW相关数据
      try {
        const swKeys = [
          'sw-session',
          'workbox-session',
          // 添加其他可能的SW相关key
        ];

        swKeys.forEach(key => {
          if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
            console.log(`清理sessionStorage: ${key}`);
          }
        });
      } catch (error) {
        console.warn('清理sessionStorage失败:', error);
      }

      console.log('Service Worker清理完成');

      // 8. 静默完成清理，避免打扰用户
      // 设置一个标记，表示已经完成清理
      const hasCleanedUp = localStorage.getItem('sw-cleanup-completed');
      if (!hasCleanedUp) {
        localStorage.setItem('sw-cleanup-completed', Date.now().toString());
        console.log('✅ Service Worker和缓存清理完成');
        console.log('📝 如果遇到任何页面显示问题，请刷新页面');
      }

    } catch (error) {
      console.error('Service Worker清理过程中出现错误:', error);
    }
  };

  // 这个组件不渲染任何内容
  return null;
}

export default ServiceWorkerCleanup; 