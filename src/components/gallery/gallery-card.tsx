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
            }, 1500) // 每1.5秒切换一张图片
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
            className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
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
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onLoad={() => setImageLoaded(true)}
                />

                {/* 加载占位符 */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                        <div className="text-gray-400 text-sm">加载中...</div>
                    </div>
                )}

                {/* 图片数量标识 */}
                <div className="absolute top-3 right-3">
                    <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                        <span>📷</span>
                        <span>{item.stats?.imageCount || item.images.length} 张</span>
                    </div>
                </div>

                {/* 轮播指示器 */}
                {isHovered && item.images.length > 1 && (
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-1">
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
                )}

                {/* 统计信息标识 */}
                {item.stats && (item.stats.likes > 0 || item.stats.comments > 0) && (
                    <div className="absolute top-3 left-3 flex gap-2">
                        {item.stats.likes > 0 && (
                            <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                                <span>❤️</span>
                                <span>{item.stats.likes}</span>
                            </div>
                        )}
                        {item.stats.comments > 0 && (
                            <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                                <span>💬</span>
                                <span>{item.stats.comments}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 分类标签 */}
                {item.category && (
                    <div className="absolute bottom-16 left-3">
                        <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {item.category}
                        </span>
                    </div>
                )}

                {/* 悬浮时的描述遮罩 */}
                <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        {item.description && (
                            <p className="text-sm leading-relaxed line-clamp-3 mb-2">{item.description}</p>
                        )}
                        
                        {/* 标签 */}
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {item.tags.slice(0, 3).map((tag, index) => (
                                    <span 
                                        key={index}
                                        className="text-xs bg-white/20 text-white px-2 py-1 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {item.tags.length > 3 && (
                                    <span className="text-xs text-white/70">
                                        +{item.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* 当前图片信息（轮播时显示） */}
                        {isHovered && item.images.length > 1 && item.images[currentImageIndex] && (
                            <div className="text-xs text-white/90 mb-1">
                                {item.images[currentImageIndex].title && (
                                    <div className="font-medium">{item.images[currentImageIndex].title}</div>
                                )}
                                {item.images[currentImageIndex].description && (
                                    <div className="text-white/70 line-clamp-1">{item.images[currentImageIndex].description}</div>
                                )}
                            </div>
                        )}

                        {/* 时间 */}
                        <div className="text-xs text-white/70">
                            {new Date(item.createdAt).toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 标题 */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium text-lg drop-shadow-lg line-clamp-2">{item.title}</h3>
            </div>

            {/* 悬浮效果边框 */}
            <div
                className={`absolute inset-0 border-2 border-white/20 rounded-2xl transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                }`}
            />
        </div>
    )
}
