'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    webVitals?: {
      onCLS: (callback: (metric: WebVitalMetric) => void) => void
      onFID: (callback: (metric: WebVitalMetric) => void) => void
      onFCP: (callback: (metric: WebVitalMetric) => void) => void
      onLCP: (callback: (metric: WebVitalMetric) => void) => void
      onTTFB: (callback: (metric: WebVitalMetric) => void) => void
    }
  }
}

interface WebVitalMetric {
  id: string
  name: string
  value: number
  delta: number
  entries: PerformanceEntry[]
  rating: 'good' | 'needs-improvement' | 'poor'
}

interface PerformanceMetrics {
  lcp: number | null
  cls: number | null
  fid: number | null
  fcp: number | null
  ttfb: number | null
  loadTime: number | null
}

function sendToAnalytics(metric: WebVitalMetric) {
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
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    cls: null,
    fid: null,
    fcp: null,
    ttfb: null,
    loadTime: null
  })

  useEffect(() => {
    // 动态导入 web-vitals
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS((metric) => {
        sendToAnalytics(metric)
        setMetrics(prev => ({ ...prev, cls: metric.value }))
      })
      onINP((metric) => {
        sendToAnalytics(metric)
        setMetrics(prev => ({ ...prev, fid: metric.value })) // INP 替代 FID
      })
      onFCP((metric) => {
        sendToAnalytics(metric)
        setMetrics(prev => ({ ...prev, fcp: metric.value }))
      })
      onLCP((metric) => {
        sendToAnalytics(metric)
        setMetrics(prev => ({ ...prev, lcp: metric.value }))
      })
      onTTFB((metric) => {
        sendToAnalytics(metric)
        setMetrics(prev => ({ ...prev, ttfb: metric.value }))
      })
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
            const loadTime = navEntry.loadEventEnd - navEntry.startTime
            setMetrics(prev => ({ ...prev, loadTime }))
            
            console.log('Navigation timing:', {
              dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              tcp: navEntry.connectEnd - navEntry.connectStart,
              request: navEntry.responseStart - navEntry.requestStart,
              response: navEntry.responseEnd - navEntry.responseStart,
              domComplete: navEntry.domComplete - navEntry.startTime,
              loadTime
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
              type: (entry as PerformanceResourceTiming).initiatorType,
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

  // 只在开发环境显示性能指标
  if (process.env.NODE_ENV !== 'development') return null

  const formatMetric = (value: number | null, unit = 'ms') => {
    if (value === null) return '--'
    return `${Math.round(value)}${unit}`
  }

  const getScoreColor = (metric: string, value: number | null) => {
    if (value === null) return 'text-gray-400'
    
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'text-green-500' : value <= 4000 ? 'text-yellow-500' : 'text-red-500'
      case 'cls':
        return value <= 0.1 ? 'text-green-500' : value <= 0.25 ? 'text-yellow-500' : 'text-red-500'
      case 'fid':
        return value <= 100 ? 'text-green-500' : value <= 300 ? 'text-yellow-500' : 'text-red-500'
      case 'fcp':
        return value <= 1800 ? 'text-green-500' : value <= 3000 ? 'text-yellow-500' : 'text-red-500'
      case 'ttfb':
        return value <= 800 ? 'text-green-500' : value <= 1800 ? 'text-yellow-500' : 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg font-mono text-xs z-50 backdrop-blur-sm">
      <div className="font-bold mb-2">Core Web Vitals</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={getScoreColor('lcp', metrics.lcp)}>
            {formatMetric(metrics.lcp)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={getScoreColor('cls', metrics.cls)}>
            {formatMetric(metrics.cls, '')}
          </span>
        </div>
        <div className="flex justify-between">
          <span>INP:</span>
          <span className={getScoreColor('fid', metrics.fid)}>
            {formatMetric(metrics.fid)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className={getScoreColor('fcp', metrics.fcp)}>
            {formatMetric(metrics.fcp)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className={getScoreColor('ttfb', metrics.ttfb)}>
            {formatMetric(metrics.ttfb)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Load:</span>
          <span className="text-blue-400">
            {formatMetric(metrics.loadTime)}
          </span>
        </div>
      </div>
    </div>
  )
}