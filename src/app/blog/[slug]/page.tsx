"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Calendar, Eye, MessageCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { Article } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import FloatingActions from '@/components/blog/floating-actions'
import CommentSection from '@/components/blog/comment-section'

export default function ArticleDetailPage() {
    const params = useParams()
    const slug = params.slug as string
    const [article, setArticle] = useState<Article | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) return
            
            try {
                setLoading(true)
                setError(null)
                const articleData = await api.getArticleBySlug(slug)
                setArticle(articleData)
                
                // 增加浏览量
                if (articleData.id) {
                    await api.incrementArticleViews(articleData.id)
                }
            } catch (err) {
                console.error('获取文章失败:', err)
                setError('文章不存在或加载失败')
            } finally {
                setLoading(false)
            }
        }

        fetchArticle()
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">文章不存在</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <Link href="/blog">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回文章列表
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="pt-16">
                <article className="max-w-4xl mx-auto px-6 py-12">
                    {/* 返回按钮 */}
                    <div className="mb-8">
                        <Link href="/blog">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                返回文章列表
                            </Button>
                        </Link>
                    </div>

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
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                                <p className="text-gray-700 dark:text-gray-300 italic">
                                    {article.excerpt}
                                </p>
                            </div>
                        )}
                    </header>

                    {/* 文章内容 */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <div
                            dangerouslySetInnerHTML={{ __html: article.content }}
                            className="prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
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

                    {/* 底部导航 */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <Link href="/blog">
                                <Button variant="outline">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    返回文章列表
                                </Button>
                            </Link>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                最后更新: {new Date(article.updatedAt).toLocaleDateString('zh-CN')}
                            </div>
                        </div>
                    </div>

                    {/* 评论区域 */}
                    <div id="comments" className="mt-12">
                        <CommentSection
                            targetType="article"
                            targetId={article.id}
                        />
                    </div>
                </article>

                {/* 悬浮操作按钮 */}
                <FloatingActions
                    targetType="article"
                    targetId={article.id}
                    autoLoad={true}
                    onComment={() => {
                        const commentSection = document.getElementById('comments')
                        commentSection?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    onShare={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: article.title,
                                text: article.excerpt || '',
                                url: window.location.href,
                            })
                        } else {
                            navigator.clipboard.writeText(window.location.href)
                            // 可以添加一个提示消息
                        }
                    }}
                    article={{
                        id: article.id,
                        title: article.title,
                        excerpt: article.excerpt,
                        author: article.author,
                        publishDate: article.publishedAt || article.createdAt,
                        category: article.category,
                        coverImage: article.coverImage
                    }}
                    shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                />
            </div>
        </div>
    )
} 