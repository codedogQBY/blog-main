"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/components/header/theme-provider"

export default function AnimatedBackground() {
    const { actualTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [elements, setElements] = useState<Array<{
        id: string
        type: string
        x: number
        y: number
        size: number
        delay: number
        duration: number
    }>>([])

    useEffect(() => {
        setMounted(true)
        generateElements()
    }, [])

    const generateElements = () => {
        const newElements = []
        
        // 生成随机位置的元素
        for (let i = 0; i < 20; i++) {
            newElements.push({
                id: `element-${i}`,
                type: i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'secondary' : 'tertiary',
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 30 + 10,
                delay: Math.random() * 5,
                duration: Math.random() * 10 + 8
            })
        }
        setElements(newElements)
    }

    if (!mounted) return null

    const isDark = actualTheme === 'dark'

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* 亮色主题元素 */}
            {!isDark && (
                <>
                    {/* 太阳 */}
                    <div className="absolute top-10 right-10 w-16 h-16 opacity-30">
                        <div className="w-full h-full bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-200">
                            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-spin-slow opacity-60"></div>
                        </div>
                        {/* 阳光射线 */}
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-8 bg-yellow-300 opacity-40"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                                    transformOrigin: '50% 100%',
                                    animation: `sunRay 3s ease-in-out infinite ${i * 0.2}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* 云朵 */}
                    {elements.slice(0, 6).map((element) => {
                        const cloudScale = Math.random() * 1.5 + 0.5; // 0.5-2倍随机缩放
                        const leftBubble = {
                            scale: Math.random() * 0.4 + 0.5, // 0.5-0.9
                            x: Math.random() * 4 + 1, // 1-5
                            y: Math.random() * 4 - 2 // -2到2
                        };
                        const rightBubble = {
                            scale: Math.random() * 0.4 + 0.3, // 0.3-0.7
                            x: Math.random() * 4 + 1, // 1-5
                            y: Math.random() * 3 - 1 // -1到2
                        };
                        const extraBubbles = Math.random() > 0.5 ? Math.floor(Math.random() * 2) + 1 : 0; // 0-2个额外泡泡
                        
                        return (
                            <div
                                key={element.id}
                                className="absolute opacity-20 animate-cloud-drift"
                                style={{
                                    left: `${element.x}%`,
                                    top: `${element.y}%`,
                                    animationDelay: `${element.delay}s`,
                                    animationDuration: `${element.duration}s`
                                }}
                            >
                                <div 
                                    className="bg-gray-200 rounded-full shadow-md"
                                    style={{
                                        width: `${element.size * cloudScale}px`,
                                        height: `${element.size * cloudScale * 0.6}px`,
                                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
                                    }}
                                >
                                    <div 
                                        className="absolute bg-gray-200 rounded-full"
                                        style={{
                                            width: `${element.size * cloudScale * leftBubble.scale}px`,
                                            height: `${element.size * cloudScale * leftBubble.scale}px`,
                                            top: `${leftBubble.y}px`,
                                            left: `${leftBubble.x}px`
                                        }}
                                    />
                                    <div 
                                        className="absolute bg-gray-200 rounded-full"
                                        style={{
                                            width: `${element.size * cloudScale * rightBubble.scale}px`,
                                            height: `${element.size * cloudScale * rightBubble.scale}px`,
                                            top: `${rightBubble.y}px`,
                                            right: `${rightBubble.x}px`
                                        }}
                                    />
                                    {Array.from({ length: extraBubbles }).map((_, i) => {
                                        const bubble = {
                                            scale: Math.random() * 0.3 + 0.2,
                                            x: Math.random() * (element.size * cloudScale * 0.8),
                                            y: Math.random() * 6 - 3
                                        };
                                        return (
                                            <div
                                                key={i}
                                                className="absolute bg-gray-200 rounded-full"
                                                style={{
                                                    width: `${element.size * cloudScale * bubble.scale}px`,
                                                    height: `${element.size * cloudScale * bubble.scale}px`,
                                                    top: `${bubble.y}px`,
                                                    left: `${bubble.x}px`
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* 更多云朵 */}
                    {elements.slice(6, 16).map((element) => {
                        const cloudScale = Math.random() * 2 + 0.3; // 0.3-2.3倍随机缩放
                        const bubbleCount = Math.floor(Math.random() * 4) + 2; // 2-5个泡泡
                        const bubbles = Array.from({ length: bubbleCount }).map(() => ({
                            scale: Math.random() * 0.6 + 0.3,
                            x: Math.random() * (element.size * cloudScale * 0.9),
                            y: Math.random() * 8 - 4,
                            opacity: Math.random() * 0.3 + 0.7
                        }));
                        
                        return (
                            <div
                                key={`extra-cloud-${element.id}`}
                                className="absolute opacity-18 animate-cloud-drift"
                                style={{
                                    left: `${element.x}%`,
                                    top: `${element.y}%`,
                                    animationDelay: `${element.delay}s`,
                                    animationDuration: `${element.duration + 5}s`
                                }}
                            >
                                <div 
                                    className="bg-gray-300 rounded-full relative"
                                    style={{
                                        width: `${element.size * cloudScale}px`,
                                        height: `${element.size * cloudScale * 0.7}px`,
                                        filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.12))'
                                    }}
                                >
                                    {bubbles.map((bubble, i) => (
                                        <div 
                                            key={i}
                                            className="absolute bg-gray-300 rounded-full"
                                            style={{
                                                width: `${element.size * cloudScale * bubble.scale}px`,
                                                height: `${element.size * cloudScale * bubble.scale}px`,
                                                left: `${bubble.x}px`,
                                                top: `${bubble.y}px`,
                                                opacity: bubble.opacity
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}

            {/* 暗色主题元素 */}
            {isDark && (
                <>
                    {/* 月亮 */}
                    <div className="absolute top-10 right-10 w-12 h-12 opacity-40">
                        <div className="w-full h-full bg-gray-200 rounded-full shadow-lg shadow-gray-400 animate-moon">
                            <div className="absolute top-1 right-1 w-3 h-3 bg-gray-400 rounded-full opacity-60"></div>
                            <div className="absolute top-3 left-2 w-2 h-2 bg-gray-400 rounded-full opacity-40"></div>
                        </div>
                    </div>

                    {/* 星星 */}
                    {elements.map((element) => {
                        const starSize = Math.random() * 3 + 1; // 1-4px 随机大小
                        return (
                            <div
                                key={`star-${element.id}`}
                                className="absolute opacity-30 animate-twinkle"
                                style={{
                                    left: `${element.x}%`,
                                    top: `${element.y}%`,
                                    animationDelay: `${element.delay}s`,
                                    animationDuration: `${element.duration / 2}s`
                                }}
                            >
                                <div 
                                    className="bg-white rounded-full shadow-sm"
                                    style={{
                                        width: `${starSize}px`,
                                        height: `${starSize}px`
                                    }}
                                />
                            </div>
                        );
                    })}

                    {/* 流星 */}
                    {elements.slice(0, 12).map((element, index) => {
                        const angle = 30 + Math.random() * 30; // 30-60度随机角度
                        const startX = Math.random() * 100 - 10; // -10% 到 90%（整个上边）
                        const startY = -(Math.random() * 20 + 15); // -35% 到 -15%（上边屏幕外）
                        return (
                            <div
                                key={`meteor-${element.id}`}
                                className="absolute opacity-40 animate-meteor-streak"
                                style={{
                                    left: `${startX}%`,
                                    top: `${startY}%`,
                                    animationDelay: `${element.delay + index * 1.5}s`,
                                    animationDuration: `${element.duration * 1}s`,
                                }}
                            >
                                {/* 流星主体 */}
                                <div 
                                    className="absolute"
                                    style={{
                                        transform: `rotate(${angle}deg)`,
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
                                            width: '40px',
                                            height: '2px',
                                            left: '-40px',
                                            top: '0.5px',
                                            opacity: 0.8,
                                            filter: 'blur(0.5px)'
                                        }}
                                    />
                                    {/* 更长的拖尾 */}
                                    <div 
                                        className="absolute bg-gradient-to-r from-blue-200 via-blue-300 to-transparent"
                                        style={{
                                            width: '60px',
                                            height: '1px',
                                            left: '-60px',
                                            top: '1px',
                                            opacity: 0.4,
                                            filter: 'blur(1px)'
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}

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