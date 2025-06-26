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
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // 悬浮时自动轮播
    useEffect(() => {
        if (isHovered && item.images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
            }, 2500) // 从 1000 改为 2500，轮播更慢
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
                    src={item.images[currentImageIndex] || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-all duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* 图片数量标识 */}
                <div className="absolute top-3 right-3 bg-black/60 text-white text-sm px-2 py-1 rounded-full backdrop-blur-sm">
                    {item.images.length}
                </div>

                {/* 悬浮时的描述遮罩 */}
                <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="text-sm leading-relaxed line-clamp-4">{item.description}</p>
                    </div>
                </div>

                {/* 轮播指示器 */}
                {item.images.length > 1 && isHovered && (
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {item.images.map((_, index) => (
                            <div
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 标题 */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium text-lg drop-shadow-lg">{item.title}</h3>
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
