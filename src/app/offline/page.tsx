"use client"

import { Button } from '@/components/ui/button';
import { WifiOff, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="mb-8">
          <WifiOff className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            网络连接中断
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            看起来您当前处于离线状态。请检查网络连接后重试。
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            重新加载
          </Button>
          
          <Link href="/">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>提示：您可以尝试以下操作：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• 检查网络连接</li>
            <li>• 刷新页面</li>
            <li>• 稍后重试</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 