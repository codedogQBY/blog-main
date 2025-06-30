"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import CommentSection from "@/components/blog/comment-section"
import FloatingActions from "@/components/blog/floating-actions"
import { getGalleryItem } from "@/lib/gallery-api"
import type { GalleryItem } from "@/types/gallery"

export default function GalleryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [imageLoaded, setImageLoaded] = useState(false)

    useEffect(() => {
        const fetchGalleryItem = async () => {
            try {
                if (id) {
                    setLoading(true)
                    const data = await getGalleryItem(id)
                    setGalleryItem(data)
                }
            } catch (err) {
                console.error('获取图库详情失败:', err)
                setError('图库项目不存在或加载失败')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchGalleryItem()
        }
    }, [id])

    const handleBack = () => {
        router.back()
    }

    const handleComment = () => {
        // 滚动到评论区域
        const commentSection = document.querySelector('#comment-section')
        if (commentSection) {
            commentSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* 加载状态 */}
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-32"></div>
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl aspect-[4/3] mb-6"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !galleryItem) {
        return (
            <div className="min-h-screen pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="p-8 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {error || '图库项目不存在'}
                            </h1>
                            <Button onClick={handleBack}>返回图库</Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* 返回按钮 */}
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="mb-6 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
                    >
                        ← 返回图库
                    </Button>

                    <div className="overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg">
                        {/* 主图展示 */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                            <Image
                                src={galleryItem.coverImage || galleryItem.images?.[0]?.imageUrl || "/placeholder.svg"}
                                alt={galleryItem.title}
                                fill
                                className={`object-cover transition-opacity duration-500 ${
                                    imageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                priority
                                onLoad={() => setImageLoaded(true)}
                            />

                            {!imageLoaded && (
                                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                                    <div className="text-gray-400">加载中...</div>
                                </div>
                            )}

                            {/* 分类标签 */}
                            {galleryItem.category && (
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-blue-500/80 text-white backdrop-blur-sm">
                                        {galleryItem.category}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* 内容区域 */}
                        <div className="p-6">
                            {/* 标题和统计 */}
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {galleryItem.title}
                                </h1>
                                
                                {galleryItem.stats && (
                                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            ❤️ {galleryItem.stats.likes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            💬 {galleryItem.stats.comments}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 描述 */}
                            {galleryItem.description && (
                                <div className="mb-6">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {galleryItem.description}
                                    </p>
                                </div>
                            )}

                            {/* 标签 */}
                            {galleryItem.tags && galleryItem.tags.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        标签
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {galleryItem.tags.map((tag, index) => (
                                            <Badge 
                                                key={index}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 元信息 */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <span>
                                    创建时间：{new Date(galleryItem.createdAt).toLocaleDateString('zh-CN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                                {galleryItem.updatedAt && galleryItem.updatedAt !== galleryItem.createdAt && (
                                    <span>
                                        更新时间：{new Date(galleryItem.updatedAt).toLocaleDateString('zh-CN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 互动区域 */}
                    <div id="comment-section" className="mt-8">
                        <CommentSection
                            targetType="gallery_image"
                            targetId={galleryItem.id}
                        />
                    </div>
                </div>
            </div>

            {/* 浮动操作按钮 */}
            <FloatingActions
                targetType="gallery_image"
                targetId={galleryItem.id}
                autoLoad={true}
                onComment={handleComment}
            />
        </div>
    )
} 