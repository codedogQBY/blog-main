'use client'

import { useEffect, useState } from 'react'

export default function ClearSWPage() {
  const [status, setStatus] = useState<string>('准备中...')

  useEffect(() => {
    const clearServiceWorker = async () => {
      try {
        setStatus('正在检查Service Worker...')
        
        // 检查是否有Service Worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          
          if (registrations.length > 0) {
            setStatus(`发现 ${registrations.length} 个Service Worker，正在卸载...`)
            
            // 卸载所有Service Worker
            for (const registration of registrations) {
              await registration.unregister()
            }
            
            setStatus('Service Worker卸载完成！')
          } else {
            setStatus('没有发现Service Worker')
          }
        } else {
          setStatus('浏览器不支持Service Worker')
        }

        setStatus('正在清除缓存...')
        
        // 清除缓存存储
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          if (cacheNames.length > 0) {
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            )
            setStatus(`清除 ${cacheNames.length} 个缓存完成！`)
          } else {
            setStatus('没有发现缓存')
          }
        }

        setStatus('清理完成！页面将在3秒后刷新...')
        
        // 3秒后刷新页面
        setTimeout(() => {
          window.location.reload()
        }, 3000)
        
      } catch (error) {
        setStatus(`清理失败: ${error}`)
      }
    }

    clearServiceWorker()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          🧹 清理Service Worker
        </h1>
        <div className="mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{status}</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>• 卸载所有Service Worker</p>
          <p>• 清除所有缓存</p>
          <p>• 自动刷新页面</p>
        </div>
      </div>
    </div>
  )
} 