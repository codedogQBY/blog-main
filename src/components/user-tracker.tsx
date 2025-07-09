'use client'

import { useEffect } from 'react'
import { initUserTracking } from '@/lib/user-tracker'

export function UserTracker() {
  useEffect(() => {
    // 页面加载完成后初始化游客追踪
    initUserTracking()
  }, [])

  // 这个组件不渲染任何内容
  return null
} 