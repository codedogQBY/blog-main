"use client"

import { useState, useEffect, useCallback } from 'react'
import { Heart, MessageCircle, ArrowUp } from 'lucide-react'
import { Button } from '../ui/button'
import { getOrGenerateFingerprint, collectUserInfo } from '@/lib/fingerprint'
import ShareButton from '../share/share-button'
import { interactionAPI } from '@/lib/interaction-api'

interface FloatingActionsProps {
  targetType?: 'article' | 'sticky_note' | 'gallery_image' | 'gallery'
  targetId?: string
  autoLoad?: boolean
  onComment?: () => void
  shareTitle?: string
  shareUrl?: string
  coverImage?: string
  onStatsUpdate?: (stats: { likes: number; comments: number; isLiked: boolean }) => void
}

interface WindowWithRefresh extends Window {
  refreshFloatingStats?: () => void;
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

  const [displayLikes, setDisplayLikes] = useState(0)
  const [displayComments, setDisplayComments] = useState(0)
  const [displayIsLiked, setDisplayIsLiked] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mounted, setMounted] = useState(false)

  const loadInteractionStats = useCallback(async () => {
    if (!targetType || !targetId) return
    try {
      const fingerprint = await getOrGenerateFingerprint()
      const stats = await interactionAPI.getInteractionStats(targetType, targetId, fingerprint)
      if (!mounted) return
      setDisplayLikes(stats.likes)
      setDisplayComments(stats.comments)
      setDisplayIsLiked(stats.isLiked)
      onStatsUpdate?.(stats)
    } catch (error) {
      console.error('Failed to load interaction stats:', error)
    }
  }, [targetType, targetId, mounted, onStatsUpdate])

  const refreshStats = useCallback(() => {
    if (mounted) {
      loadInteractionStats()
    }
  }, [mounted, loadInteractionStats])

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
  }, [autoLoad, targetType, targetId, mounted, loadInteractionStats])

  // 将refreshStats方法暴露到window对象，供父组件调用
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      const win = window as WindowWithRefresh
      win.refreshFloatingStats = refreshStats
    }
    return () => {
      if (typeof window !== 'undefined') {
        const win = window as WindowWithRefresh
        delete win.refreshFloatingStats
      }
    }
  }, [targetType, targetId, mounted, refreshStats])

  const handleLike = async () => {
    if (!targetType || !targetId) return

    const fingerprint = await getOrGenerateFingerprint()
    
    // 检查指纹是否有效
    if (!fingerprint || fingerprint.trim() === '') {
      console.warn('无法获取有效的浏览器指纹，跳过点赞操作')
      return
    }

    // 乐观更新：立即更新UI状态
    const previousIsLiked = displayIsLiked
    const previousLikes = displayLikes
    const newIsLiked = !displayIsLiked
    const newLikes = newIsLiked ? displayLikes + 1 : displayLikes - 1
    
    setDisplayIsLiked(newIsLiked)
    setDisplayLikes(newLikes)

    try {
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
      
      // 使用服务器返回的准确数据更新状态
      setDisplayLikes(result.totalLikes)
      setDisplayIsLiked(result.isLiked)
    } catch (error) {
      console.error('Failed to like:', error)
      
      // 发生错误时回滚到之前的状态
      if (mounted) {
        setDisplayIsLiked(previousIsLiked)
        setDisplayLikes(previousLikes)
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
          className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg transition-all duration-300 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
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
            className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg transition-all duration-300 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
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