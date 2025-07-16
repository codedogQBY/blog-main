'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // 检查是否已经是PWA环境
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      return;
    }

    // 初始化关闭次数
    const count = Number(localStorage.getItem('pwaInstallPromptCloseCount') || '0');
    
    // 检查是否达到最大次数
    if (count >= 2) {
      return;
    }

    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // 强制更新Service Worker
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        })
        .catch((error) => {
          console.error('PWA Install Prompt - Service Worker registration failed:', error);
        });
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const currentCount = Number(localStorage.getItem('pwaInstallPromptCloseCount') || '0');
      if (currentCount < 2) {
        // 延迟显示，让页面先加载完成
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 对于iOS设备，手动触发安装提示（因为iOS不支持beforeinstallprompt）
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isInWebAppiOS && count < 2) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    }

    // 手动检查PWA条件
    const checkPWAConditions = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = document.querySelector('link[rel="manifest"]');
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';

      // 如果条件满足但没有触发beforeinstallprompt，手动显示
      if (hasServiceWorker && hasManifest && isSecure && !isIOS && count < 2) {
        setTimeout(() => {
          if (!deferredPrompt && !showInstallPrompt) {
            setShowInstallPrompt(true);
          }
        }, 5000);
      }
    };

    checkPWAConditions();

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [deferredPrompt, showInstallPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      setDeferredPrompt(null);
    } else {
      // 对于不支持安装提示的浏览器，显示手动安装指南
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('要安装此应用：\n1. 点击分享按钮 \n2. 选择"添加到主屏幕"\n3. 点击"添加"');
      } else {
        alert('要安装此应用：\n1. 点击浏览器菜单（通常是三个点）\n2. 选择"安装应用"或"添加到主屏幕"');
      }
    }
    
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    
    const count = Number(localStorage.getItem('pwaInstallPromptCloseCount') || '0') + 1;
    localStorage.setItem('pwaInstallPromptCloseCount', String(count));
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            📱 安装应用
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            将博客添加到主屏幕，获得更好的浏览体验，支持离线访问
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-3 h-3" />
              立即安装
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
            >
              稍后再说
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 