"use client"

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, ArrowUp } from 'lucide-react'
import { Button } from '../ui/button'
import { getOrGenerateFingerprint, collectUserInfo } from '@/lib/fingerprint'
import ShareButton from '../share/share-button'
import { interactionAPI } from '@/lib/interaction-api'

interface FloatingActionsProps {
  targetType?: 'article' | 'sticky_note' | 'gallery_image'
  targetId?: string
  autoLoad?: boolean
  onComment?: () => void
  shareTitle?: string
  shareUrl?: string
  coverImage?: string
  onStatsUpdate?: (stats: { likes: number; comments: number; isLiked: boolean }) => void
}

export default function FloatingActions({
  targetType,
  targetId,
  autoLoad = false,
  onComment,
  shareTitle = '',
  shareUrl,
  coverImage = '',
  onStatsUpdate
}: FloatingActionsProps) {
  const [loading, setLoading] = useState(false)
  const [displayLikes, setDisplayLikes] = useState(0)
  const [displayComments, setDisplayComments] = useState(0)
  const [displayIsLiked, setDisplayIsLiked] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 组件挂载和卸载
  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  // 监听滚动位置
  useEffect(() => {
    const handleScroll = () => {
      if (mounted) {
        setShowScrollTop(window.scrollY > 300)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  // 新的自动加载功能
  useEffect(() => {
    if (autoLoad && targetType && targetId && mounted) {
      loadInteractionStats()
    }
  }, [autoLoad, targetType, targetId, mounted])

  const loadInteractionStats = async () => {
    if (!targetType || !targetId) return

    try {
      const fingerprint = await getOrGenerateFingerprint()
      const stats = await interactionAPI.getInteractionStats(targetType, targetId, fingerprint)
      
      // 检查组件是否仍然挂载
      if (!mounted) return
      
      setDisplayLikes(stats.likes)
      setDisplayComments(stats.comments)
      setDisplayIsLiked(stats.isLiked)
      
      // 通知父组件统计数据已更新
      onStatsUpdate?.(stats)
    } catch (error) {
      console.error('Failed to load interaction stats:', error)
    }
  }

  // 暴露刷新方法给父组件
  const refreshStats = () => {
    if (mounted) {
      loadInteractionStats()
    }
  }

  // 将refreshStats方法暴露到window对象，供父组件调用
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      (window as any).refreshFloatingStats = refreshStats
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).refreshFloatingStats
      }
    }
  }, [targetType, targetId, mounted])

  const handleLike = async () => {
    if (!targetType || !targetId || loading) return

    try {
      setLoading(true)
      const fingerprint = await getOrGenerateFingerprint()
      const userInfo = await collectUserInfo()
      const result = await interactionAPI.toggleLike({
        targetType,
        targetId,
        fingerprint,
        userInfo: {
          ...userInfo,
          nickname: '匿名用户',
        }
      })
      
      // 检查组件是否仍然挂载
      if (!mounted) return
      
      setDisplayLikes(result.totalLikes)
      setDisplayIsLiked(result.isLiked)
    } catch (error) {
      console.error('Failed to like:', error)
    } finally {
      if (mounted) {
        setLoading(false)
      }
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3">
      {/* 点赞按钮 */}
      <div className="group relative">
        <Button
          onClick={handleLike}
          disabled={loading}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer ${
            displayIsLiked
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
          } dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600`}
        >
          <div className="flex flex-col items-center">
            <Heart 
              className={`w-5 h-5 ${displayIsLiked ? 'fill-current' : ''}`} 
            />
            <span className="text-xs font-medium">{displayLikes}</span>
          </div>
        </Button>
        
        {/* 悬停提示 */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {displayIsLiked ? '取消点赞' : '点赞'}
        </div>
      </div>

      {/* 评论按钮 */}
      <div className="group relative">
        <Button
          onClick={onComment}
          className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        >
          <div className="flex flex-col items-center">
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">{displayComments}</span>
          </div>
        </Button>
        
        {/* 悬停提示 */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          评论
        </div>
      </div>

      {/* 分享按钮 */}
      {mounted && shareUrl && (
        <ShareButton 
          title={shareTitle} 
          url={shareUrl}
          coverImage={coverImage}
        />
      )}

      {/* 回到顶部按钮 */}
      {mounted && showScrollTop && (
        <div className="group relative">
          <Button
            onClick={scrollToTop}
            className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <div className="flex flex-col items-center">
              <ArrowUp className="w-5 h-5" />
            </div>
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