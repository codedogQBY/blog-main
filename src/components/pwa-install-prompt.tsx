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
  const [closeCount, setCloseCount] = useState(0);

  useEffect(() => {
    // 初始化关闭次数
    const count = Number(localStorage.getItem('pwaInstallPromptCloseCount') || '0');
    setCloseCount(count);
    if (count >= 2) return; // 超过2次不再提示

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // 只要没超过2次才弹窗
      if (Number(localStorage.getItem('pwaInstallPromptCloseCount') || '0') < 2) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装提示');
    } else {
      console.log('用户拒绝了安装提示');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    // 增加关闭次数
    const count = Number(localStorage.getItem('pwaInstallPromptCloseCount') || '0') + 1;
    localStorage.setItem('pwaInstallPromptCloseCount', String(count));
    setCloseCount(count);
  };

  if (!showInstallPrompt || closeCount >= 2) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            安装应用
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            将博客添加到主屏幕，获得更好的浏览体验
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              安装
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
            >
              稍后
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 