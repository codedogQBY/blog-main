import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'

interface Metric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// 性能指标阈值
// const THRESHOLDS = {
//   CLS: { good: 0.1, poor: 0.25 },
//   FID: { good: 100, poor: 300 },
//   FCP: { good: 1800, poor: 3000 },
//   LCP: { good: 2500, poor: 4000 },
//   TTFB: { good: 800, poor: 1800 }
// }

// 获取性能评级
// function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
//   const thresholds = THRESHOLDS[metricName as keyof typeof THRESHOLDS]
//   if (!thresholds) return 'good'
//   
//   if (value <= thresholds.good) return 'good'
//   if (value <= thresholds.poor) return 'needs-improvement'
//   return 'poor'
// }

// 发送指标到分析服务
function sendToAnalytics(metric: Metric) {
  // 这里可以发送到 Google Analytics、自定义分析服务等
  console.log('Web Vitals:', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id
  })

  // 发送到自定义分析服务
  // if (typeof window !== 'undefined' && (window as unknown as { gtag?: (event: string, data: Record<string, unknown>) => void }).gtag) {
  //   (window as unknown as { gtag: (event: string, data: Record<string, unknown>) => void }).gtag('event', metric.name, {
  //     event_category: 'Web Vitals',
  //     value: Math.round(metric.value),
  //     event_label: metric.rating,
  //     non_interaction: true,
  //   })
  // }
}

// 初始化 Web Vitals 监控
export function initWebVitals() {
  if (typeof window === 'undefined') return

  // 监控 CLS (Cumulative Layout Shift)
  onCLS(sendToAnalytics)
  
  // 监控 FID (First Input Delay) - 已在新版本中移除
  // onFID(sendToAnalytics)
  
  // 监控 FCP (First Contentful Paint)
  onFCP(sendToAnalytics)
  
  // 监控 LCP (Largest Contentful Paint)
  onLCP(sendToAnalytics)
  
  // 监控 TTFB (Time to First Byte)
  onTTFB(sendToAnalytics)
}

// 手动测量性能指标
export function measurePerformance() {
  if (typeof window === 'undefined') return

  // 测量页面加载时间
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (navigation) {
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    
    console.log('Performance Metrics:', {
      loadTime: `${loadTime}ms`,
      domContentLoaded: `${domContentLoaded}ms`,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
    })
  }

  // 测量资源加载时间
  const resources = performance.getEntriesByType('resource')
  const slowResources = resources.filter(resource => resource.duration > 1000)
  
  if (slowResources.length > 0) {
    console.warn('Slow resources detected:', slowResources.map(r => ({
      name: r.name,
      duration: `${r.duration}ms`
    })))
  }
}

// 监控长任务
export function monitorLongTasks() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 50) { // 50ms 以上的任务
        console.warn('Long task detected:', {
          duration: `${entry.duration}ms`,
          startTime: entry.startTime,
          name: entry.name
        })
      }
    })
  })

  observer.observe({ entryTypes: ['longtask'] })
}

// 监控内存使用
export function monitorMemory() {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
  console.log('Memory usage:', {
    used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
    total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
    limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
  })
} 