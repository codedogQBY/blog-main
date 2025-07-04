"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import CommentSection from "@/components/blog/comment-section"
import FloatingActions from "@/components/blog/floating-actions"
import { getGalleryItem } from "@/lib/gallery-api"
import type { GalleryItem } from "@/types/gallery"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ShareButton from '@/components/share/share-button'

export default function GalleryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const containerRef = useRef<HTMLDivElement>(null)

    const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
        const commentSection = document.querySelector('#comment-section')
        if (commentSection) {
            commentSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-20">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="space-y-4">
                            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !galleryItem) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md mx-4">
                    <div className="text-4xl mb-4">😔</div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        {error || '图库项目不存在'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        抱歉，我们找不到您要访问的图库内容
                    </p>
                    <Button onClick={handleBack}>
                        返回图库
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="relative">
            {/* 返回列表 */}
            <Link
                href="/gallery"
                className="absolute -left-20 top-0 hidden lg:flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                <span>返回列表</span>
            </Link>

            <div className="min-h-screen pt-20">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <article className="space-y-8">
                        {/* 标题 */}
                        <header>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                {galleryItem.title}
                            </h1>
                            
                            {/* 分类和标签 */}
                            <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                                {galleryItem.category && (
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        {galleryItem.category}
                                    </span>
                                )}
                                {galleryItem.tags && galleryItem.tags.length > 0 && (
                                    <>
                                        {galleryItem.category && <span>/</span>}
                                        {galleryItem.tags.map((tag, index) => (
                                            <span key={index} className="text-purple-600 dark:text-purple-400">
                                                #{tag}
                                            </span>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* 创建时间 */}
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(galleryItem.createdAt).toLocaleDateString('zh-CN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </header>

                        {/* 简介 */}
                        {galleryItem.description && (
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                                {galleryItem.description}
                            </div>
                        )}

                        {/* 图片展示 */}
                        {galleryItem.images && galleryItem.images.length > 0 && (
                            <div className="space-y-8">
                                {galleryItem.images.map((image, index) => (
                                    <div key={image.id} className="space-y-2">
                                        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                            <Image
                                                src={image.imageUrl}
                                                alt={image.title || `图片 ${index + 1}`}
                                                width={1200}
                                                height={800}
                                                className="w-full h-auto object-contain"
                                                sizes="(max-width: 1024px) 100vw, 1024px"
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
                        {(!galleryItem.images || galleryItem.images.length === 0) && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <div className="text-4xl mb-4">📷</div>
                                <p>暂无图片内容</p>
                            </div>
                        )}
                    </article>

                    {/* 评论区域 */}
                    <div id="comment-section" className="mt-16">
                        <CommentSection
                            targetType="gallery_image"
                            targetId={galleryItem.id}
                        />
                    </div>
                </div>

                {/* 浮动操作按钮 */}
                <FloatingActions 
                    targetType="gallery_image"
                    targetId={galleryItem.id}
                    autoLoad={true}
                    onComment={handleComment}
                    shareTitle={galleryItem.title}
                    shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                    coverImage={galleryItem.coverImage || galleryItem.images?.[0]?.imageUrl}
                />
            </div>
        </div>
    )
} 