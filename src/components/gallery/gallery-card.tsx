"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import type { GalleryItem } from "@/types/gallery"

interface GalleryCardProps {
    item: GalleryItem
    onClick?: (item: GalleryItem) => void
}

export default function GalleryCard({ item, onClick }: GalleryCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const touchStartRef = useRef<number>(0)

    // 检测是否为移动设备
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
        }
        
        checkIsMobile()
        window.addEventListener('resize', checkIsMobile)
        return () => window.removeEventListener('resize', checkIsMobile)
    }, [])

    // 使用封面图或第一张图片作为展示图
    const displayImage = (isHovered || (isMobile && showDetails)) && item.images.length > 1 
        ? item.images[currentImageIndex]?.imageUrl 
        : (item.coverImage || item.images[0]?.imageUrl || "/placeholder.svg")

    // 轮播逻辑
    useEffect(() => {
        const shouldStartCarousel = (isHovered && !isMobile) || (isMobile && showDetails)
        
        if (shouldStartCarousel && item.images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
            }, 2000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            setCurrentImageIndex(0)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isHovered, isMobile, showDetails, item.images.length])

    // 处理移动端触摸事件
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = Date.now()
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchDuration = Date.now() - touchStartRef.current
        
        // 短按切换详情显示，长按进入详情页
        if (touchDuration < 300) {
            e.stopPropagation()
            if (item.images.length > 1) {
                setShowDetails(!showDetails)
            } else {
                onClick?.(item)
            }
        } else {
            onClick?.(item)
        }
    }

    // 处理图片切换（移动端点击图片切换）
    const handleImageClick = (e: React.MouseEvent) => {
        if (isMobile && item.images.length > 1) {
            e.stopPropagation()
            setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
        }
    }

    const isShowingDetails = (isHovered && !isMobile) || (isMobile && showDetails)

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 bg-white dark:bg-gray-800 ${
                !isMobile ? 'hover:scale-[1.02] hover:shadow-2xl' : 'active:scale-[0.98]'
            }`}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => !isMobile && onClick?.(item)}
        >
            {/* 图片容器 */}
            <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                    src={displayImage}
                    alt={item.title}
                    fill
                    className={`object-cover transition-all duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    } ${isShowingDetails ? 'scale-110' : 'scale-100'}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onLoad={() => setImageLoaded(true)}
                    onClick={handleImageClick}
                />

                {/* 加载占位符 */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                        <div className="text-gray-400 text-sm">加载中...</div>
                    </div>
                )}

                {/* 移动端提示文字 */}
                {isMobile && item.images.length > 1 && !showDetails && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <div className="bg-black/70 text-white text-sm px-3 py-2 rounded-full backdrop-blur-sm animate-pulse">
                            轻点预览 · 长按查看
                        </div>
                    </div>
                )}

                {/* 右上角：图片数量标识 */}
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-black/70 text-white text-xs px-2.5 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 border border-white/20">
                        <span>📷</span>
                        <span className="font-medium">{item.stats?.imageCount || item.images.length}</span>
                        {isMobile && item.images.length > 1 && (
                            <span className="text-xs opacity-75">/{item.images.length}</span>
                        )}
                    </div>
                </div>

                {/* 左上角：统计信息标识 */}
                {item.stats && (item.stats.likes > 0 || item.stats.comments > 0) && (
                    <div className="absolute top-3 left-3 z-10 flex gap-2">
                        {item.stats.likes > 0 && (
                            <div className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                                <span>❤️</span>
                                <span className="font-medium">{item.stats.likes}</span>
                            </div>
                        )}
                        {item.stats.comments > 0 && (
                            <div className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                                <span>💬</span>
                                <span className="font-medium">{item.stats.comments}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 轮播指示器 */}
                {isShowingDetails && item.images.length > 1 && (
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-black/60 rounded-full px-3 py-1.5 backdrop-blur-sm flex gap-1.5">
                            {item.images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        index === currentImageIndex 
                                            ? 'bg-white' 
                                            : 'bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 移动端：当前图片序号 */}
                {isMobile && showDetails && item.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 z-10">
                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {currentImageIndex + 1} / {item.images.length}
                        </div>
                    </div>
                )}

                {/* 默认信息层（非详情状态） */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
                    isShowingDetails ? 'opacity-0' : 'opacity-100'
                }`}>
                    <div className="p-4 pt-8">
                        {/* 分类标签 */}
                        {item.category && (
                            <div className="mb-2">
                                <span className="bg-blue-500/90 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
                                    {item.category}
                                </span>
                            </div>
                        )}
                        
                        {/* 标题 */}
                        <h3 className="text-white font-semibold text-lg leading-tight line-clamp-1 drop-shadow-lg">
                            {item.title}
                        </h3>
                        
                        {/* 移动端显示更多基础信息 */}
                        {isMobile && (
                            <div className="mt-2 text-white/80 text-sm">
                                📅 {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                            </div>
                        )}
                    </div>
                </div>

                {/* 详情信息遮罩 */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-opacity duration-300 ${
                    isShowingDetails ? "opacity-100" : "opacity-0"
                }`}>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-3">
                        
                        {/* 标题 */}
                        <div>
                            <h3 className="text-white font-bold text-xl leading-tight mb-1 drop-shadow-lg line-clamp-1">
                                {item.title}
                            </h3>
                            
                            {/* 分类标签 */}
                            {item.category && (
                                <span className="inline-block bg-blue-500/90 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm font-medium">
                                    {item.category}
                                </span>
                            )}
                        </div>

                        {/* 描述 */}
                        {item.description && (
                            <p className="text-white/90 text-sm leading-relaxed line-clamp-2 bg-black/20 rounded-lg p-2 backdrop-blur-sm">
                                {item.description}
                            </p>
                        )}
                        
                        {/* 当前图片信息（轮播时显示） */}
                        {item.images.length > 1 && item.images[currentImageIndex] && (
                            <div className="bg-black/30 rounded-lg p-2 backdrop-blur-sm">
                                <div className="text-sm text-white/90">
                                    <span className="text-xs text-white/70">正在显示：</span>
                                    {item.images[currentImageIndex].title && (
                                        <div className="font-medium truncate line-clamp-1">{item.images[currentImageIndex].title}</div>
                                    )}
                                    {item.images[currentImageIndex].description && (
                                        <div className="text-xs text-white/70 mt-0.5 line-clamp-1">{item.images[currentImageIndex].description}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 标签 */}
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {item.tags.slice(0, isMobile ? 2 : 3).map((tag, index) => (
                                    <span 
                                        key={index}
                                        className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm border border-white/20"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {item.tags.length > (isMobile ? 2 : 3) && (
                                    <span className="text-xs text-white/70 px-2 py-1">
                                        +{item.tags.length - (isMobile ? 2 : 3)} 更多
                                    </span>
                                )}
                            </div>
                        )}

                        {/* 时间和操作提示 */}
                        <div className="flex items-center justify-between text-xs text-white/70 bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                            <span>
                                📅 {new Date(item.createdAt).toLocaleDateString('zh-CN', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                            {isMobile && (
                                <span className="text-white/60">
                                    {item.images.length > 1 ? '点击切换 · 长按查看' : '长按查看详情'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
