"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function AnimatedBackground() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [elements, setElements] = useState<Array<{
        id: string
        type: string
        x: number
        y: number
        size: number
        delay: number
        duration: number
        angle?: number
        startX?: number
        startY?: number
    }>>([])

    useEffect(() => {
        setMounted(true)
        
        // 只在客户端生成随机元素
        const newElements = []
        
        // 生成随机位置的元素
        for (let i = 0; i < 50; i++) {  // 增加星星数量
            const element = {
                id: `element-${i}`,
                type: 'star',
                x: Math.random() * 100,
                y: Math.random() * 70 + 5,
                size: Math.random() * 2 + 1,  // 调整星星尺寸范围为1-3px
                delay: Math.random() * 15,
                duration: Math.random() * 3 + 2,  // 调整闪烁动画时间
                angle: 30 + Math.random() * 30,
                startX: Math.random() * 40 - 10,
                startY: -(Math.random() * 30 + 10)
            };
            newElements.push(element);
        }
        setElements(newElements)
    }, [])

    // 服务端渲染或未挂载时不渲染任何内容
    if (!mounted) return null

    const isDark = theme === 'dark'

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* 亮色主题元素 */}
            {!isDark && (
                <>
                    {/* 太阳 */}
                    <div className="absolute top-10 right-10 w-16 h-16 opacity-30 z-10">
                        <div className="w-full h-full bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-200">
                            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-spin-slow opacity-60"></div>
                        </div>
                    </div>
                </>
            )}

            {/* 暗色主题元素 */}
            {isDark && mounted && (
                <>
                    {/* 月亮 */}
                    <div className="absolute top-10 right-10 w-12 h-12 opacity-40 z-10">
                        <div className="w-full h-full bg-gray-200 rounded-full shadow-lg shadow-gray-400 animate-moon">
                            <div className="absolute top-1 right-1 w-3 h-3 bg-gray-400 rounded-full opacity-60"></div>
                            <div className="absolute top-3 left-2 w-2 h-2 bg-gray-400 rounded-full opacity-40"></div>
                        </div>
                    </div>

                    {/* 星星 */}
                    {elements.map((element) => (
                        <div
                            key={`star-${element.id}`}
                            className="absolute opacity-30 animate-twinkle"
                            style={{
                                left: `${element.x}%`,
                                top: `${element.y}%`,
                                animationDelay: `${element.delay}s`,
                                animationDuration: `${element.duration}s`
                            }}
                        >
                            <div 
                                className="bg-white rounded-full shadow-sm"
                                style={{
                                    width: `${element.size}px`,
                                    height: `${element.size}px`
                                }}
                            />
                        </div>
                    ))}

                    {/* 流星 */}
                    {elements.slice(0, 32).map((element, index) => (
                        <div
                            key={`meteor-${element.id}`}
                            className="absolute opacity-40 animate-meteor-streak"
                            style={{
                                left: `${element.startX}%`,
                                top: `${element.startY}%`,
                                animationDelay: `${element.delay + index * 2}s`,
                                animationDuration: `${element.duration * 2}s`,
                            }}
                        >
                            {/* 流星主体 */}
                            <div 
                                className="absolute"
                                style={{
                                    transform: `rotate(${element.angle}deg)`,
                                    transformOrigin: '0 0',
                                }}
                            >
                                {/* 流星头部 */}
                                <div 
                                    className="absolute bg-white rounded-full"
                                    style={{
                                        width: '3px',
                                        height: '3px',
                                        boxShadow: '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8)',
                                        filter: 'blur(0.5px)'
                                    }}
                                />
                                {/* 流星拖尾 */}
                                <div 
                                    className="absolute bg-gradient-to-r from-white via-blue-200 to-transparent"
                                    style={{
                                        width: '60px',
                                        height: '2px',
                                        left: '-60px',
                                        top: '0.5px',
                                        opacity: 0.8,
                                        filter: 'blur(0.5px)'
                                    }}
                                />
                                {/* 更长的拖尾 */}
                                <div 
                                    className="absolute bg-gradient-to-r from-blue-200 via-blue-300 to-transparent"
                                    style={{
                                        width: '80px',
                                        height: '1px',
                                        left: '-80px',
                                        top: '1px',
                                        opacity: 0.4,
                                        filter: 'blur(1px)'
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                    {/* 云朵（夜间版本） */}
                    {elements.slice(10, 13).map((element) => (
                        <div
                            key={`night-cloud-${element.id}`}
                            className="absolute opacity-10 animate-float"
                            style={{
                                left: `${element.x}%`,
                                top: `${element.y}%`,
                                animationDelay: `${element.delay}s`,
                                animationDuration: `${element.duration}s`
                            }}
                        >
                            <div 
                                className="bg-gray-600 rounded-full shadow-lg"
                                style={{
                                    width: `${element.size}px`,
                                    height: `${element.size * 0.6}px`
                                }}
                            >
                                <div 
                                    className="absolute bg-gray-600 rounded-full -top-2 left-2"
                                    style={{
                                        width: `${element.size * 0.7}px`,
                                        height: `${element.size * 0.7}px`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    )
} 