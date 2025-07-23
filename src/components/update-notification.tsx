"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, Download, AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import { startAutoCheck, forceRefresh, type UpdateCheckResult } from '@/lib/version-manager';

interface UpdateNotificationProps {
  onClose?: () => void;
}

export default function UpdateNotification({ onClose }: UpdateNotificationProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // 启动版本检查
    startAutoCheck((result) => {
      if (result.hasUpdate && !userDismissed) {
        setUpdateInfo(result);
        setIsVisible(true);
        
        // 如果是强制更新，自动展开
        if (result.shouldForceUpdate) {
          setTimeout(() => setIsExpanded(true), 500);
        }
      }
    });

    return () => {
      // 组件卸载时停止检查
      // stopAutoCheck(); // 注释掉，让检查继续运行
    };
  }, [userDismissed]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // 短暂延迟，让用户看到加载状态
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 强制刷新
      await forceRefresh();
    } catch (error) {
      console.error('更新失败:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setUserDismissed(true);
    onClose?.();
  };

  const handleLater = () => {
    setIsVisible(false);
    // 10分钟后重新显示
    setTimeout(() => {
      if (!userDismissed) {
        setIsVisible(true);
      }
    }, 10 * 60 * 1000);
  };

  const toggleExpand = () => {
    if (!updateInfo?.shouldForceUpdate) {
      setIsExpanded(!isExpanded);
    }
  };

  if (!isVisible || !updateInfo) {
    return null;
  }

  const { shouldForceUpdate, latestVersion } = updateInfo;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div 
        className={`
          bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 
          pointer-events-auto transform transition-all duration-500 ease-out overflow-hidden
          ${isVisible ? 'animate-slide-in-right' : 'animate-slide-out-right'}
          ${isExpanded ? 'w-80' : 'w-64'}
        `}
      >
        {/* 紧凑模式 */}
        {!isExpanded && (
          <div 
            className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${shouldForceUpdate ? 'cursor-default' : ''}`}
            onClick={toggleExpand}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-1.5 rounded-full flex-shrink-0 ${shouldForceUpdate ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                {shouldForceUpdate ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {shouldForceUpdate ? '重要更新' : '新版本'}
                  </h4>
                  {!shouldForceUpdate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss();
                      }}
                      className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {shouldForceUpdate ? '需要立即更新' : `v${latestVersion?.version} 可用`}
                </p>
              </div>
            </div>

            {/* 快速操作按钮 */}
            <div className="flex space-x-2 mt-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate();
                }}
                disabled={isUpdating}
                size="sm"
                className={`flex-1 h-7 text-xs ${shouldForceUpdate ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                {isUpdating ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  shouldForceUpdate ? '立即更新' : '更新'
                )}
              </Button>
              
              {!shouldForceUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLater();
                  }}
                  className="h-7 text-xs px-2"
                  disabled={isUpdating}
                >
                  稍后
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 展开模式 */}
        {isExpanded && (
          <div className="p-4">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${shouldForceUpdate ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                  {shouldForceUpdate ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {shouldForceUpdate ? '重要更新' : '新版本可用'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    版本 {latestVersion?.version}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {!shouldForceUpdate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleExpand}
                    className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                )}
                {!shouldForceUpdate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* 内容 */}
            <div className="space-y-3">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {shouldForceUpdate ? (
                  <>
                    此更新包含重要的功能改进和安全修复，建议立即更新。
                  </>
                ) : (
                  <>
                    包含功能优化和体验改进，建议更新获得最佳体验。
                  </>
                )}
              </p>

              {latestVersion && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">构建时间</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(latestVersion.buildTime).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  {latestVersion.gitHash && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">版本标识</span>
                      <span className="font-mono text-gray-900 dark:text-white text-xs">
                        {latestVersion.gitHash}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-2 mt-4">
              {!shouldForceUpdate && (
                <Button
                  variant="outline"
                  onClick={handleLater}
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  disabled={isUpdating}
                >
                  稍后提醒
                </Button>
              )}
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                size="sm"
                className={`${shouldForceUpdate ? 'flex-1' : 'flex-1'} h-8 text-xs ${shouldForceUpdate ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                {isUpdating ? (
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>更新中...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{shouldForceUpdate ? '立即更新' : '现在更新'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 全局样式（需要添加到globals.css中）
const styles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out;
}

.animate-slide-out-right {
  animation: slide-out-right 0.5s ease-out;
}
`;

// 导出样式以便在其他地方使用
export { styles as updateNotificationStyles }; 