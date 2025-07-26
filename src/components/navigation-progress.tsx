"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  // 开始进度条动画
  const startProgress = () => {
    setIsLoading(true)
    setProgress(0)

    // 模拟进度增长 - 更平滑的动画
    const timer1 = setTimeout(() => setProgress(20), 50)
    const timer2 = setTimeout(() => setProgress(40), 150)
    const timer3 = setTimeout(() => setProgress(60), 300)
    const timer4 = setTimeout(() => setProgress(80), 500)
    const timer5 = setTimeout(() => setProgress(95), 700)
    const timer6 = setTimeout(() => {
      setProgress(100)
      // 完成后隐藏进度条
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 300)
    }, 900)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      clearTimeout(timer6)
    }
  }

  // 监听链接点击事件
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
        // 检查是否是内部链接
        try {
          const url = new URL(link.href)
          if (url.origin === window.location.origin) {
            // 排除一些特殊链接
            const pathname = url.pathname
            if (!pathname.startsWith('/api/') && !pathname.includes('mailto:') && !pathname.includes('tel:')) {
              console.log('🔗 检测到内部链接点击，开始进度条...', pathname)
              startProgress()
            }
          }
        } catch {
          // 忽略无效的 URL
        }
      }
    }

    // 监听点击事件
    document.addEventListener('click', handleLinkClick)
    
    return () => {
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  // 路由变化时完成进度条
  useEffect(() => {
    if (isLoading) {
      // 如果已经在加载中，快速完成进度条
      const timer = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setIsLoading(false)
          setProgress(0)
        }, 200)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [pathname, isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
} 