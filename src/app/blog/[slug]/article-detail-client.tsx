"use client"

import { useEffect, useRef } from "react"
import { Calendar, Eye, MessageCircle } from "lucide-react"
import type { Article } from "@/lib/api"
import Image from "next/image"
import FloatingActions from '@/components/blog/floating-actions'
import CommentSection from '@/components/blog/comment-section'

interface ArticleDetailClientProps {
  article: Article
}

interface WindowWithRefresh extends Window {
  refreshFloatingStats?: () => void
}

export default function ArticleDetailClient({ article }: ArticleDetailClientProps) {
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

  // 代码高亮效果
  useEffect(() => {
    if (article?.content) {
      // 简单的代码高亮处理
      const highlightCode = () => {
        const codeBlocks = document.querySelectorAll('pre code')
        codeBlocks.forEach((block) => {
          // 为代码块添加基本的样式类
          block.classList.add('language-generic')
        })
      }
      
      // 延迟执行，确保DOM已更新
      setTimeout(highlightCode, 100)
    }
  }, [article?.content])

  return (
    <div ref={containerRef} className="relative">
      <div className="min-h-screen">
        <div className="pt-20">
          <article className="max-w-4xl mx-auto px-6 py-12">
            {/* 文章头部 */}
            <header className="mb-12">
              {/* 封面图片 */}
              {article.coverImage && (
                <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* 标题 */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {article.title}
              </h1>

              {/* 文章信息 */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <time>
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('zh-CN')}
                  </time>
                </div>
                
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>{article.views} 次阅读</span>
                </div>

                {article._count?.comments !== undefined && (
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span>{article._count.comments} 条评论</span>
                  </div>
                )}

                {article.readTime && (
                  <div className="text-gray-500">
                    约 {article.readTime} 分钟阅读
                  </div>
                )}
              </div>

              {/* 分类和标签 */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                  {typeof article.category === 'object' ? article.category.name : article.category}
                </span>
                
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => {
                      const tagName = typeof tag === 'string' ? tag : tag.tag.name
                      return (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded text-sm"
                        >
                          #{tagName}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 摘要 */}
              {article.excerpt && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg border-l-4 border-blue-400">
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    {article.excerpt}
                  </p>
                </div>
              )}
            </header>

            {/* 文章内容 */}
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-100 dark:prose-pre:text-gray-200">
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* 作者信息 */}
            {article.author && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(() => {
                      const authorName = typeof article.author === 'object' ? article.author.name : article.author
                      return typeof authorName === 'string' ? authorName.charAt(0) : 'A'
                    })()}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {typeof article.author === 'object' ? article.author.name : article.author}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">作者</p>
                  </div>
                </div>
              </div>
            )}

            {/* 评论区域 */}
            <div id="comments" className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <CommentSection 
                targetType="article"
                targetId={article.id}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </article>
        </div>
      </div>

      {/* 浮动操作按钮 */}
      <FloatingActions 
        targetType="article"
        targetId={article.id}
        autoLoad={true}
        onComment={() => {
          const commentSection = document.getElementById('comments')
          commentSection?.scrollIntoView({ behavior: 'smooth' })
        }}
        shareTitle={article.title}
        shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
        coverImage={article.coverImage}
      />
    </div>
  )
} 