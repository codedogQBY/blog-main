"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, MapPin, Monitor, Smartphone, Tablet, Reply } from 'lucide-react'
import { interactionAPI, type Comment } from '@/lib/interaction-api'
import { getOrGenerateFingerprint, collectUserInfo } from '@/lib/fingerprint'
import { useAuthStore } from '@/lib/auth'

interface CommentSectionProps {
  targetType: 'article' | 'sticky_note' | 'gallery_image'
  targetId: string
  onCommentAdded?: () => void
}

export default function CommentSection({ targetType, targetId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [mounted, setMounted] = useState(true)
  const { isLoggedIn, username, isSuperAdmin } = useAuthStore()

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  useEffect(() => {
    // 添加调试信息
    console.log('评论组件状态变化:', {
      isLoggedIn,
      username,
      isSuperAdmin,
      currentNickname: nickname
    })
    
    // 如果已登录，使用登录用户名
    if (isLoggedIn && username) {
      console.log('设置登录用户名:', username)
      setNickname(username)
    } else {
      // 否则使用本地存储的昵称
      const savedNickname = localStorage.getItem('comment-nickname')
      console.log('使用本地存储昵称:', savedNickname)
      if (savedNickname) {
        setNickname(savedNickname)
      }
    }
  }, [isLoggedIn, username])

  // 加载评论
  const loadComments = async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      const response = await interactionAPI.getComments(targetType, targetId, pageNum, 10)
      
      if (!mounted) return
      
      if (append) {
        setComments(prev => [...prev, ...response.comments])
      } else {
        setComments(response.comments)
      }
      
      setHasMore(response.hasMore)
      setTotal(response.total)
      setPage(pageNum)
    } catch (error) {
      console.error('加载评论失败:', error)
    } finally {
      if (mounted) {
        setLoading(false)
      }
    }
  }

  // 提交评论
  const submitComment = async () => {
    if (!content.trim()) return

    try {
      setSubmitting(true)
      const fingerprint = getOrGenerateFingerprint()
      const userInfo = await collectUserInfo()
      
      // 保存用户输入的昵称和邮箱（仅未登录时）
      if (!isLoggedIn) {
        if (nickname) {
          localStorage.setItem('comment-nickname', nickname)
        }
        if (email) {
          localStorage.setItem('comment-email', email)
        }
      }

      const newComment = await interactionAPI.addComment({
        targetType,
        targetId,
        fingerprint,
        content: content.trim(),
        userInfo: {
          ...userInfo,
          nickname: nickname || '匿名用户',
          email: email || undefined,
          isAdmin: isSuperAdmin,
        },
      })

      if (!mounted) return

      // 添加到评论列表顶部
      setComments(prev => [newComment, ...prev])
      setContent('')
      setTotal(prev => prev + 1)
      
      // 通知父组件评论已添加
      onCommentAdded?.()
    } catch (error) {
      console.error('评论失败:', error)
    } finally {
      if (mounted) {
        setSubmitting(false)
      }
    }
  }

  // 提交回复
  const submitReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    try {
      setSubmitting(true)
      const fingerprint = getOrGenerateFingerprint()
      const userInfo = await collectUserInfo()

      const reply = await interactionAPI.addComment({
        targetType,
        targetId,
        fingerprint,
        content: replyContent.trim(),
        parentId,
        userInfo: {
          ...userInfo,
          nickname: nickname || '匿名用户',
          email: email || undefined,
          isAdmin: isSuperAdmin,
        },
      })

      if (!mounted) return

      // 更新评论列表，添加回复
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply]
          }
        }
        return comment
      }))

      setReplyContent('')
      setReplyTo(null)
      setTotal(prev => prev + 1)
      
      // 通知父组件评论已添加
      onCommentAdded?.()
    } catch (error) {
      console.error('回复失败:', error)
    } finally {
      if (mounted) {
        setSubmitting(false)
      }
    }
  }

  // 获取设备图标
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  // 渲染单个评论
  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12 mt-4' : 'mb-6'} p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {comment.userInfo.nickname.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {comment.userInfo.nickname}
              {comment.userInfo.isAdmin && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
                  站长
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{comment.userInfo.city}</span>
              </div>
              <div className="flex items-center space-x-1">
                {getDeviceIcon(comment.userInfo.deviceType)}
                <span>{comment.userInfo.deviceType}</span>
              </div>
              {comment.userInfo.browserInfo && (
                <span>{comment.userInfo.browserInfo.name}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatTime(comment.createdAt)}
        </div>
      </div>
      
      <div className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
        {comment.content}
      </div>
      
      {!isReply && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            className="text-gray-500 hover:text-blue-600"
          >
            <Reply className="w-4 h-4 mr-1" />
            回复
          </Button>
          
          {comment.replies.length > 0 && (
            <span className="text-xs text-gray-500">
              {comment.replies.length} 条回复
            </span>
          )}
        </div>
      )}
      
      {/* 回复表单 */}
      {replyTo === comment.id && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="写下你的回复..."
            className="mb-3 resize-none"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReplyTo(null)
                setReplyContent('')
              }}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={() => submitReply(comment.id)}
              disabled={!replyContent.trim() || submitting}
            >
              <Send className="w-4 h-4 mr-1" />
              回复
            </Button>
          </div>
        </div>
      )}
      
      {/* 回复列表 */}
      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  // 初始化加载
  useEffect(() => {
    const loadInitialComments = async () => {
      try {
        setLoading(true)
        const response = await interactionAPI.getComments(targetType, targetId, 1, 10)
        
        // 检查组件是否仍然挂载
        if (!mounted) return
        
        setComments(response.comments)
        setHasMore(response.hasMore)
        setTotal(response.total)
        setPage(1)
      } catch (error) {
        console.error('加载评论失败:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadInitialComments()
    
    // 恢复用户信息
    const savedNickname = localStorage.getItem('comment-nickname')
    const savedEmail = localStorage.getItem('comment-email')
    if (savedNickname && mounted) setNickname(savedNickname)
    if (savedEmail && mounted) setEmail(savedEmail)
  }, [targetType, targetId, mounted])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          评论 ({total})
        </h3>
      </div>

      {/* 评论表单 */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="昵称（可选）"
            className="bg-gray-50 dark:bg-gray-700"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱（可选，不会公开）"
            type="email"
            className="bg-gray-50 dark:bg-gray-700"
          />
        </div>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的评论..."
          className="mb-4 resize-none bg-gray-50 dark:bg-gray-700"
          rows={4}
        />
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            支持回复和表情，请文明评论
          </div>
          <Button
            onClick={submitComment}
            disabled={!content.trim() || (!isLoggedIn && !nickname) || submitting}
            className="min-w-[100px]"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            发表评论
          </Button>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="space-y-6">
        {comments.map(comment => renderComment(comment))}
      </div>

      {/* 加载更多 */}
      {hasMore && comments.length > 0 && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => loadComments(page + 1, true)}
            disabled={loading}
          >
            {loading ? '加载中...' : '加载更多评论'}
          </Button>
        </div>
      )}

      {/* 空状态 */}
      {!loading && comments.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            还没有评论，来发表第一条评论吧！
          </p>
        </div>
      )}
    </div>
  )
} 