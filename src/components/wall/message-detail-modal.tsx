"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Heart, MessageCircle, Eye, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { StickyNoteData } from "./sticky-note"
import { toggleLike, addComment, getComments } from "@/lib/interaction-api"
import { getOrGenerateFingerprint, collectUserInfo } from "@/lib/fingerprint"
import { useAuthStore } from '@/lib/auth'

// 本地评论接口，用于UI显示
interface Comment {
  id: string
  author: string
  content: string
  date: string
  isAdmin?: boolean
}

interface MessageDetailModalProps {
  isOpen: boolean
  onClose: () => void
  note: StickyNoteData | null
  onLike?: (id: string) => void
  onCommentAdded?: (noteId: string, newCommentCount: number) => void
}

const modernColorThemes = {
  pink: {
    gradient: "from-rose-400/20 via-pink-300/15 to-rose-500/20",
    border: "border-rose-200/30",
    accent: "bg-gradient-to-r from-rose-400 to-pink-500",
    text: "text-rose-600",
  },
  yellow: {
    gradient: "from-amber-400/20 via-yellow-300/15 to-orange-400/20",
    border: "border-amber-200/30",
    accent: "bg-gradient-to-r from-amber-400 to-orange-500",
    text: "text-amber-600",
  },
  blue: {
    gradient: "from-blue-400/20 via-cyan-300/15 to-blue-500/20",
    border: "border-blue-200/30",
    accent: "bg-gradient-to-r from-blue-400 to-cyan-500",
    text: "text-blue-600",
  },
  green: {
    gradient: "from-emerald-400/20 via-green-300/15 to-teal-400/20",
    border: "border-emerald-200/30",
    accent: "bg-gradient-to-r from-emerald-400 to-teal-500",
    text: "text-emerald-600",
  },
  purple: {
    gradient: "from-violet-400/20 via-purple-300/15 to-indigo-400/20",
    border: "border-violet-200/30",
    accent: "bg-gradient-to-r from-violet-400 to-indigo-500",
    text: "text-violet-600",
  },
}

export default function MessageDetailModal({ isOpen, onClose, note, onLike, onCommentAdded }: MessageDetailModalProps) {
  const [commentText, setCommentText] = useState("")
  const [commentAuthor, setCommentAuthor] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [fingerprint, setFingerprint] = useState<string>("")
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const { isLoggedIn, username, isSuperAdmin } = useAuthStore()

  // 如果已登录，使用登录用户名
  useEffect(() => {
    if (isLoggedIn && username) {
      setCommentAuthor(username)
    } else {
      // 恢复保存的用户名
      const savedAuthor = localStorage.getItem('wall-comment-author')
      if (savedAuthor) {
        setCommentAuthor(savedAuthor)
      }
    }
  }, [isLoggedIn, username])

  // 获取用户指纹
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await getOrGenerateFingerprint()
        setFingerprint(fp)
      } catch (error) {
        console.error('获取指纹失败:', error)
      }
    }
    initFingerprint()
  }, [])

  // 加载评论数据
  const loadComments = useCallback(async () => {
    if (!note) return 0
    
    setIsLoadingComments(true)
    try {
      const response = await getComments('sticky_note', note.id)
      
      // 递归格式化评论，包括回复
      const formatComment = (comment: any): Comment => ({
        id: comment.id,
        author: comment.userInfo.nickname || '匿名',
        content: comment.content,
        date: formatDate(comment.createdAt),
        isAdmin: comment.userInfo.isAdmin || false,
      })
      
      // 扁平化所有评论（包括回复）
      const flattenComments = (comments: any[]): Comment[] => {
        const result: Comment[] = []
        comments.forEach(comment => {
          result.push(formatComment(comment))
          if (comment.replies && comment.replies.length > 0) {
            result.push(...flattenComments(comment.replies))
          }
        })
        return result
      }
      
      const formattedComments = flattenComments(response.comments)
      setComments(formattedComments)
      return formattedComments.length
    } catch (error) {
      console.error('加载评论失败:', error)
      return 0
    } finally {
      setIsLoadingComments(false)
    }
  }, [note?.id])

  useEffect(() => {
    if (isOpen && note) {
      loadComments()
      // 如果已登录，设置默认用户名
      if (isLoggedIn && username) {
        setCommentAuthor(username)
      }
    }
  }, [isOpen, note?.id, isLoggedIn, username])

  // 锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${month}/${day} ${hour}:${minute}`
  }

  if (!isOpen || !note) return null

  const theme = modernColorThemes[note.color]

  const handleLike = async () => {
    if (!fingerprint) return
    
    try {
      const baseUserInfo = await collectUserInfo()
      const userInfo = {
        ...baseUserInfo,
        nickname: commentAuthor.trim() || '匿名',
      }
      await toggleLike({
        targetType: 'sticky_note',
        targetId: note.id,
        fingerprint,
        userInfo
      })
      // 更新父组件的点赞状态
      onLike?.(note.id)
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !fingerprint) return

    setIsSubmittingComment(true)
    try {
      // 保存用户输入的昵称（仅未登录时）
      if (!isLoggedIn && commentAuthor.trim()) {
        localStorage.setItem('wall-comment-author', commentAuthor.trim())
      }

      const baseUserInfo = await collectUserInfo()
      // 设置用户昵称
      const userInfo = {
        ...baseUserInfo,
        nickname: commentAuthor.trim() || '匿名',
        isAdmin: isSuperAdmin,
      }
      await addComment({
        targetType: 'sticky_note',
        targetId: note.id,
        fingerprint,
        userInfo,
        content: commentText.trim()
      })
      // 重新加载评论并获取最新数量
      const newCommentCount = await loadComments()
      // 通知父组件更新评论数量
      onCommentAdded?.(note.id, newCommentCount)
      // 重置表单
      setCommentText("")
      setCommentAuthor("")
    } catch (error) {
      console.error('添加评论失败:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={onClose}
        style={{
          background: "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      {/* 弹窗内容 */}
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden max-h-[90vh] flex flex-col transform transition-all duration-500 ease-out">
        {/* 头部 - 完全对齐创建留言样式，固定高度 */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
          <header className="relative flex items-center justify-between p-6 h-[88px]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">详情</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">查看留言详情</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-10 h-10 p-0 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </Button>
          </header>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 便签内容 */}
          <article
            className={`
    relative overflow-hidden rounded-3xl border backdrop-blur-xl
    bg-gradient-to-br ${theme.gradient} 
    ${theme.border} 
    shadow-lg
  `}
          >
            {/* Top accent bar */}
            <div className={`h-6 w-full ${theme.accent} opacity-80`} />

            <div className="relative p-8 space-y-6">
              {/* Header */}
              <header className="flex items-start justify-between">
                <div className="flex items-center space-x-2 opacity-70">
                  <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <time className="text-xs font-medium text-gray-600 dark:text-gray-300">{note.date}</time>
                </div>
              </header>

              {/* Content */}
              <div className="space-y-3">
                <p className="text-gray-800 dark:text-gray-100 text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">
                  {note.content}
                </p>
              </div>

              {/* Category tag */}
              <div className="flex justify-start">
                <span
                  className={`
          inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold
          bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-600/20
          ${theme.text} dark:text-gray-300
        `}
                >
                  <Tag className="w-3 h-3" />
                  <span>{note.category}</span>
                </span>
              </div>

                             {/* Footer */}
               <footer className="flex items-center justify-between pt-2">
                 {/* Interaction buttons */}
                 <div className="flex items-center space-x-1">
                   <button
                     onClick={handleLike}
                     className={`
             flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all duration-300
             hover:scale-110 active:scale-95 transform-gpu
             ${
               note.isLiked
                 ? "bg-red-500/20 text-red-500 shadow-red-500/20 shadow-lg"
                 : "hover:bg-white/30 dark:hover:bg-gray-700/30 text-gray-500 dark:text-gray-400 hover:text-red-500"
             }
           `}
                   >
                     <Heart
                       className={`
               w-4 h-4 transition-all duration-300 group-hover/like:scale-125
               ${note.isLiked ? "fill-current animate-pulse" : "hover:fill-current"}
             `}
                     />
                     <span className="text-xs font-bold">{note.likes}</span>
                   </button>

                  <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-gray-500 dark:text-gray-400">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">{note.comments}</span>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center space-x-2 opacity-80">
                  <div
                    className={`
            w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold
            ${theme.accent} shadow-lg
          `}
                  >
                    {note.author.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{note.author}</span>
                </div>
              </footer>
            </div>
          </article>

          {/* 评论输入 */}
          <div className="space-y-4">
            {/* 大文本框 */}
            <div className="relative group">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="请输入..."
                className="
                  min-h-[120px] resize-none w-full p-4 text-sm rounded-2xl
                  bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm
                  border border-gray-200/50 dark:border-gray-600/50
                  placeholder:text-gray-500 dark:placeholder:text-gray-400
                  text-gray-900 dark:text-gray-100
                  transition-all duration-300 ease-out
                  focus:outline-none focus:ring-0 focus-visible:ring-0
                  focus:border-blue-400 dark:focus:border-blue-500
                  focus:bg-white dark:focus:bg-gray-700
                  focus:shadow-xl focus:shadow-blue-500/25 dark:focus:shadow-blue-400/25
                  focus:scale-[1.02] focus:-translate-y-1
                  hover:border-gray-300/70 dark:hover:border-gray-500/70
                "
                maxLength={500}
                style={{ boxShadow: "none" }}
              />
              {/* 字数统计 */}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full backdrop-blur-sm">
                {commentText.length}/500
              </div>
              {/* 聚焦指示器 */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
            </div>

            {/* 底部操作区 */}
            <div className="flex space-x-3">
              <div className="relative flex-1 group">
                <Input
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="署名"
                  className="
                    h-12 px-4 text-sm rounded-xl w-full
                    bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm
                    border border-gray-200/50 dark:border-gray-600/50
                    placeholder:text-gray-500 dark:placeholder:text-gray-400
                    text-gray-900 dark:text-gray-100
                    transition-all duration-300 ease-out
                    focus:outline-none focus:ring-0 focus-visible:ring-0
                    focus:border-blue-400 dark:focus:border-blue-500
                    focus:bg-white dark:focus:bg-gray-700
                    focus:shadow-xl focus:shadow-blue-500/25 dark:focus:shadow-blue-400/25
                    focus:scale-105 focus:-translate-y-0.5
                    hover:border-gray-300/70 dark:hover:border-gray-500/70
                  "
                  maxLength={10}
                  style={{ boxShadow: "none" }}
                />
                {/* 聚焦指示器 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
              </div>
                             <Button
                 onClick={handleAddComment}
                 disabled={!commentText.trim() || isSubmittingComment}
                 className="
                   h-12 px-8 rounded-xl border-0 shadow-lg font-semibold
                   bg-gradient-to-r from-blue-500 to-purple-600 
                   hover:from-blue-600 hover:to-purple-700
                   text-white transition-all duration-300 transform 
                   hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30
                   active:scale-95 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                   disabled:hover:shadow-lg
                 "
               >
                 {isSubmittingComment ? (
                   <div className="flex items-center space-x-2">
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     <span>发布中...</span>
                   </div>
                 ) : (
                   '评论'
                 )}
               </Button>
            </div>
          </div>

                     {/* 评论列表 */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
               <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
               评论 {comments.length}
             </h3>
             
             {isLoadingComments ? (
               <div className="flex items-center justify-center py-8">
                 <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                 <span className="ml-2 text-gray-500 dark:text-gray-400">加载评论中...</span>
               </div>
             ) : comments.length > 0 ? (
               <div className="space-y-4">
                 {comments.map((comment) => (
                   <div
                     key={comment.id}
                     className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-600/20"
                   >
                     <div className="flex space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg flex items-center justify-center text-white text-sm font-bold">
                         {comment.author.charAt(0).toUpperCase()}
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center space-x-2 mb-2">
                           <span className="font-semibold text-gray-900 dark:text-white text-sm">{comment.author}</span>
                           {comment.isAdmin && (
                             <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
                               站长
                             </span>
                           )}
                           <time className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                             {comment.date}
                           </time>
                         </div>
                         <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8">
                 <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <MessageCircle className="w-6 h-6 text-gray-400" />
                 </div>
                 <p className="text-gray-500 dark:text-gray-400">暂无评论，快来抢沙发吧！</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}
