'use client';

import { useEffect } from 'react';
import { initServiceWorker, getServiceWorkerStatus } from '@/lib/service-worker';

export function ServiceWorkerManager() {
  useEffect(() => {
    // 页面加载完成后初始化 Service Worker
    const initSW = async () => {
      try {
        await initServiceWorker();
        
        // 检查 Service Worker 状态
        const status = getServiceWorkerStatus();
        console.log('[SW] Service Worker status:', status);
        
        if (status.supported && status.registered) {
          console.log('[SW] Service Worker is active and ready');
        }
      } catch (error) {
        console.error('[SW] Failed to initialize Service Worker:', error);
      }
    };

    // 延迟初始化，确保页面完全加载
    const timer = setTimeout(initSW, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // 这个组件不渲染任何内容
  return null;
}

export default ServiceWorkerManager; 