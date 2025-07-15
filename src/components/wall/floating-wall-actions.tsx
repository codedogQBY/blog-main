"use client"

import { useState, useEffect } from 'react'
import { Plus, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FloatingWallActionsProps {
  onAddMessage: () => void
}

export default function FloatingWallActions({ onAddMessage }: FloatingWallActionsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3">
      {/* 添加留言按钮 */}
      <div className="group relative">
        <Button
          onClick={onAddMessage}
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </Button>
        
        {/* 悬停提示 */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          添加留言
        </div>
      </div>

      {/* 回到顶部按钮 */}
      {showScrollTop && (
        <div className="group relative">
          <Button
            onClick={scrollToTop}
            className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
          
          {/* 悬停提示 */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            回到顶部
          </div>
        </div>
      )}
    </div>
  )
} 