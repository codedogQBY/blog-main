'use client'

import { useEffect } from 'react'
import { initWebVitals, measurePerformance, monitorLongTasks, monitorMemory } from '@/lib/web-vitals'

export function PerformanceMonitor() {
  useEffect(() => {
    // 初始化 Web Vitals 监控
    initWebVitals()
    
    // 监控长任务
    monitorLongTasks()
    
    // 页面加载完成后测量性能
    const timer = setTimeout(() => {
      measurePerformance()
      monitorMemory()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return null
} 