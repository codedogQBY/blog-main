'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    webVitals?: {
      getCLS: (callback: (metric: any) => void) => void
      getFID: (callback: (metric: any) => void) => void
      getFCP: (callback: (metric: any) => void) => void
      getLCP: (callback: (metric: any) => void) => void
      getTTFB: (callback: (metric: any) => void) => void
    }
  }
}

function sendToAnalytics(metric: any) {
  // 发送性能数据到分析平台
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch((error) => {
      console.warn('Failed to send web vitals:', error)
    })
  } else {
    console.log('Web Vital:', metric)
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    // 动态导入 web-vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics)
      getFID(sendToAnalytics)
      getFCP(sendToAnalytics)
      getLCP(sendToAnalytics)
      getTTFB(sendToAnalytics)
    })
  }, [])

  useEffect(() => {
    // 监控资源加载性能
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // 监控导航性能
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            console.log('Navigation timing:', {
              dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              tcp: navEntry.connectEnd - navEntry.connectStart,
              request: navEntry.responseStart - navEntry.requestStart,
              response: navEntry.responseEnd - navEntry.responseStart,
              domComplete: navEntry.domComplete - navEntry.navigationStart,
            })
          }
        })
      })

      navObserver.observe({ entryTypes: ['navigation'] })

      // 监控资源加载
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 1000) { // 超过1秒的资源
            console.warn('Slow resource:', {
              name: entry.name,
              duration: entry.duration,
              type: (entry as any).initiatorType,
            })
          }
        })
      })

      resourceObserver.observe({ entryTypes: ['resource'] })

      return () => {
        navObserver.disconnect()
        resourceObserver.disconnect()
      }
    }
  }, [])

  return null
}