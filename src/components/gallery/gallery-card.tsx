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
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // 使用封面图或第一张图片作为展示图
    const displayImage = isHovered && item.images.length > 1 
        ? item.images[currentImageIndex]?.imageUrl 
        : (item.coverImage || item.images[0]?.imageUrl || "/placeholder.svg")

    // 悬浮轮播效果
    useEffect(() => {
        if (isHovered && item.images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
            }, 2500) // 轮播速度调慢一些
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
    }, [isHovered, item.images.length])

    return (
        <div
            className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-white dark:bg-gray-800"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick?.(item)}
        >
            {/* 图片容器 */}
            <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                    src={displayImage}
                    alt={item.title}
                    fill
                    className={`object-cover transition-all duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    } ${isHovered ? 'scale-110' : 'scale-100'}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onLoad={() => setImageLoaded(true)}
                />

                {/* 加载占位符 */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                        <div className="text-gray-400 text-sm">加载中...</div>
                    </div>
                )}

                {/* 右上角：图片数量标识 */}
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-black/70 text-white text-xs px-2.5 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 border border-white/20">
                        <span>📷</span>
                        <span className="font-medium">{item.stats?.imageCount || item.images.length}</span>
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

                {/* 轮播指示器 - 悬浮时显示在顶部中央 */}
                {isHovered && item.images.length > 1 && (
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

                {/* 非悬浮状态：简单的底部信息 */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
                    isHovered ? 'opacity-0' : 'opacity-100'
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
                        <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2 drop-shadow-lg">
                            {item.title}
                        </h3>
                    </div>
                </div>

                {/* 悬浮状态：详细信息遮罩 */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                }`}>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-3">
                        
                        {/* 标题 */}
                        <div>
                            <h3 className="text-white font-bold text-xl leading-tight mb-1 drop-shadow-lg">
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
                                        <div className="font-medium truncate">{item.images[currentImageIndex].title}</div>
                                    )}
                                    {item.images[currentImageIndex].description && (
                                        <div className="text-white/80 text-xs line-clamp-1">{item.images[currentImageIndex].description}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 标签 */}
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {item.tags.slice(0, 3).map((tag, index) => (
                                    <span 
                                        key={index}
                                        className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm border border-white/20"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {item.tags.length > 3 && (
                                    <span className="text-xs text-white/70 px-2 py-1">
                                        +{item.tags.length - 3} 更多
                                    </span>
                                )}
                            </div>
                        )}

                        {/* 时间信息 */}
                        <div className="flex items-center justify-between text-xs text-white/70 bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                            <span>
                                📅 {new Date(item.createdAt).toLocaleDateString('zh-CN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                            {item.images.length > 1 && (
                                <span>
                                    🔄 {currentImageIndex + 1}/{item.images.length}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 悬浮效果边框 */}
            <div className={`absolute inset-0 border-2 rounded-2xl transition-all duration-300 ${
                isHovered 
                    ? "border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                    : "border-transparent"
            }`} />
        </div>
    )
}
