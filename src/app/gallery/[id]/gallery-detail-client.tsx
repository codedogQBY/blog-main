"use client"

import { useRef } from "react"
import Image from "next/image"
import CommentSection from "@/components/blog/comment-section"
import FloatingActions from "@/components/blog/floating-actions"
import type { GalleryItem } from "@/types/gallery"

interface WindowWithRefresh extends Window {
  refreshFloatingStats?: () => void
}

interface GalleryDetailClientProps {
  gallery: GalleryItem
}

export default function GalleryDetailClient({ gallery }: GalleryDetailClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleCommentAdded = () => {
    // 评论添加后，刷新悬浮按钮的统计数据
    if (typeof window !== 'undefined') {
      const win = window as WindowWithRefresh
      if (win.refreshFloatingStats) {
        win.refreshFloatingStats()
      }
    }
  }

  const handleComment = () => {
    const commentSection = document.querySelector('#comment-section')
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <article className="space-y-8">
            {/* 标题 */}
            <header>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {gallery.title}
              </h1>
              
              {/* 分类和标签 */}
              <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                {gallery.category && (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {gallery.category}
                  </span>
                )}
                {gallery.tags && gallery.tags.length > 0 && (
                  <>
                    {gallery.category && <span>/</span>}
                    {gallery.tags.map((tag, index) => (
                      <span key={index} className="text-purple-600 dark:text-purple-400">
                        #{tag}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {/* 创建时间 */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(gallery.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </header>

            {/* 简介 */}
            {gallery.description && (
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                {gallery.description}
              </div>
            )}

            {/* 图片展示 */}
            {gallery.images && gallery.images.length > 0 && (
              <div className="space-y-8">
                {gallery.images.map((image, index) => (
                  <div key={image.id} className="space-y-2">
                    <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={image.imageUrl}
                        alt={image.title || `图片 ${index + 1}`}
                        width={1200}
                        height={800}
                        className="w-full h-auto object-contain"
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        unoptimized={true}
                      />
                    </div>
                    {/* 图片标题和描述 */}
                    {(image.title || image.description) && (
                      <div className="space-y-1">
                        {image.title && (
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {image.title}
                          </h3>
                        )}
                        {image.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {image.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 没有图片的情况 */}
            {(!gallery.images || gallery.images.length === 0) && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">📷</div>
                <p>暂无图片内容</p>
              </div>
            )}
          </article>

          {/* 评论区域 */}
          <div id="comment-section" className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <CommentSection 
              targetType="gallery"
              targetId={gallery.id}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        </div>

        {/* 浮动操作按钮 */}
        <FloatingActions
          targetType="gallery"
          targetId={gallery.id}
          autoLoad={true}
          onComment={handleComment}
          shareTitle={gallery.title}
          shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
          coverImage={gallery.coverImage || gallery.images?.[0]?.imageUrl}
        />
      </div>
    </div>
  )
}