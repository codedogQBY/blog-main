"use client"

import React, { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// 懒加载非关键组件
const LazyAnimatedBackground = dynamic(() => import('./animated-background'), {
  ssr: false,
  loading: () => null
})

const LazyScrollToTop = dynamic(() => import('./scroll-to-top'), {
  ssr: false,
  loading: () => null
})

const LazyPerformanceMonitor = dynamic(() => import('./performance-monitor').then(mod => ({ default: mod.PerformanceMonitor })), {
  ssr: false,
  loading: () => null
})

const LazyUserTracker = dynamic(() => import('./user-tracker').then(mod => ({ default: mod.UserTracker })), {
  ssr: false,
  loading: () => null
})

const LazyPWAInstallPrompt = dynamic(() => import('./pwa-install-prompt').then(mod => ({ default: mod.PWAInstallPrompt })), {
  ssr: false,
  loading: () => null
})

const LazyServiceWorkerManager = dynamic(() => import('./service-worker-manager').then(mod => ({ default: mod.ServiceWorkerManager })), {
  ssr: false,
  loading: () => null
})

const LazyUpdateNotification = dynamic(() => import('./update-notification'), {
  ssr: false,
  loading: () => null
})

// 延迟加载组件包装器
export function DelayedComponents() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // 延迟加载非关键组件
    const timer = setTimeout(() => {
      setShouldLoad(true)
    }, 2000) // 2秒后开始加载

    return () => clearTimeout(timer)
  }, [])

  if (!shouldLoad) {
    return null
  }

  return (
    <>
      <Suspense fallback={null}>
        <LazyAnimatedBackground />
      </Suspense>
      
      <Suspense fallback={null}>
        <LazyScrollToTop />
      </Suspense>
      
      <Suspense fallback={null}>
        <LazyPerformanceMonitor />
      </Suspense>
      
      <Suspense fallback={null}>
        <LazyUserTracker />
      </Suspense>
      
      <Suspense fallback={null}>
        <LazyPWAInstallPrompt />
      </Suspense>
      
      <Suspense fallback={null}>
        <LazyServiceWorkerManager />
      </Suspense>
      
      <Suspense fallback={null}>
        <LazyUpdateNotification />
      </Suspense>
    </>
  )
} 