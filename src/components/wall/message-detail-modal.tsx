"use client"

import { useState } from 'react'
import { X, Heart, MessageCircle, Share2, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StickyNote {
  id: string
  content: string
  likes?: number
  date: string
  location?: string
  author?: string
  category?: string
  color?: string
}

interface MessageDetailModalProps {
  message: StickyNote
  isOpen: boolean
  onClose: () => void
}

export default function MessageDetailModal({ message, isOpen, onClose }: MessageDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(message.likes || 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">便签详情</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 便签内容 */}
          <div className="mb-6">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>

          {/* 元信息 */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{message.date}</span>
            </div>
            {message.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{message.location}</span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsLiked(!isLiked)
                setLikes((prev: number) => isLiked ? prev - 1 : prev + 1)
              }}
              className={`flex items-center gap-2 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="w-4 h-4" />
              <span>评论</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-500 hover:text-green-500"
            >
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
