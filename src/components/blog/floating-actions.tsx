"use client"

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { interactionAPI } from '@/lib/interaction-api'
import { getOrGenerateFingerprint, collectUserInfo } from '@/lib/fingerprint'

interface FloatingActionsProps {
  // 可选的直接传入数据（向后兼容）
  likes?: number
  isLiked?: boolean
  comments?: number
  onLike?: () => void
  onComment?: () => void  
  onShare?: () => void
  
  // 新的自动加载功能
  targetType?: 'article' | 'sticky_note' | 'gallery_image'
  targetId?: string
  autoLoad?: boolean
  
  // 文章信息（用于分享）
  article?: {
    id: string
    title: string
    excerpt?: string
    author?: string | { name: string }
    publishDate?: string
    category?: string | { name: string }
    coverImage?: string
  }
  shareUrl?: string
}

export default function FloatingActions({
  likes: propLikes = 0,
  isLiked: propIsLiked = false,
  comments: propComments = 0,
  targetType,
  targetId,
  autoLoad = false,
  onLike,
  onComment,
  onShare,
  article,
  shareUrl
}: FloatingActionsProps) {
  const [internalLikes, setInternalLikes] = useState(propLikes)
  const [internalComments, setInternalComments] = useState(propComments)
  const [internalIsLiked, setInternalIsLiked] = useState(propIsLiked)
  const [loading, setLoading] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // 使用内部状态或外部传入的props
  const displayLikes = autoLoad ? internalLikes : propLikes
  const displayComments = autoLoad ? internalComments : propComments
  const displayIsLiked = autoLoad ? internalIsLiked : propIsLiked

  // 处理点赞
  const handleLike = async () => {
    if (autoLoad && targetType && targetId) {
      try {
        setLoading(true)
        const fingerprint = getOrGenerateFingerprint()
        const userInfo = await collectUserInfo()
        
        const result = await interactionAPI.toggleLike({
          targetType,
          targetId,
          fingerprint,
          userInfo,
        })
        
        setInternalIsLiked(result.isLiked)
        setInternalLikes(result.totalLikes)
      } catch (error) {
        console.error('点赞失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    // 调用外部回调
    onLike?.()
  }

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 自动加载交互统计
  useEffect(() => {
    if (!autoLoad || !targetType || !targetId) return
    
    const loadStats = async () => {
      try {
        setLoading(true)
        const fingerprint = getOrGenerateFingerprint()
        const stats = await interactionAPI.getInteractionStats(targetType, targetId, fingerprint)
        
        setInternalLikes(stats.likes)
        setInternalIsLiked(stats.isLiked)
        setInternalComments(stats.comments)
      } catch (error) {
        console.error('加载交互数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [targetType, targetId, autoLoad])

  if (loading && displayLikes === 0 && displayComments === 0) {
    return (
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3">
      {/* 点赞按钮 */}
      <div className="group relative">
        <Button
          onClick={handleLike}
          disabled={loading}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
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
      {article && shareUrl && (
        <div className="group relative">
          <Button
            onClick={onShare}
            className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          
          {/* 悬停提示 */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            分享
          </div>
        </div>
      )}

      {/* 回到顶部按钮 */}
      {showScrollTop && (
        <div className="group relative">
          <Button
            onClick={scrollToTop}
            className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
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