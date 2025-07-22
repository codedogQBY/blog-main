"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { diaryApi, type DiarySignature } from "@/lib/diary-api"
import type { Note } from "@/types/note"
import WeatherIcon from "./weather-icon"

interface NotePaperProps {
    note: Note | null
    variant?: 'home' | 'diary' // 添加variant属性，默认为diary
}

export default function NotePaper({ note }: NotePaperProps) {
    const [signature, setSignature] = useState<DiarySignature | null>(null)

    // 加载签名配置
    useEffect(() => {
        const loadSignature = async () => {
            try {
                const activeSignature = await diaryApi.getActiveSignature()
                setSignature(activeSignature)
            } catch (error) {
                console.error('加载签名失败:', error)
            }
        }

        loadSignature()
    }, [])

    // 获取字体大小的像素值
    const getFontSizeValue = (size: string) => {
        const sizeMap: Record<string, string> = {
            'sm': '14px',
            'base': '16px', 
            'lg': '18px',
            'xl': '20px',
            '2xl': '24px',
            '3xl': '30px'
        }
        return sizeMap[size] || '24px'
    }

    // 获取颜色值
    const getColorValue = (color: string) => {
        const colorMap: Record<string, string> = {
            'gray-400': '#9ca3af',
            'blue-400': '#60a5fa',
            'green-400': '#4ade80',
            'purple-400': '#a78bfa',
            'red-400': '#f87171',
            'yellow-400': '#facc15',
            'pink-400': '#f472b6'
        }
        return colorMap[color] || '#9ca3af'
    }

    // 获取心情表情
    const getMoodEmoji = (mood?: number) => {
        if (mood === undefined || mood === null) return ''
        const moodMap: Record<number, string> = {
            0: '😞',
            1: '😕', 
            2: '😐',
            3: '🙂',
            4: '😊',
            5: '😄'
        }
        return moodMap[mood] || ''
    }

    if (!note) {
        return (
            <div className="h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-2xl">📝</div>
                    </div>
                    <p className="text-lg font-medium mb-2">选择一篇随记</p>
                    <p className="text-sm">点击左侧列表中的随记来查看详细内容</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
            {/* 信纸头部 */}
            <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                {/* 标题和元信息 */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
                    {/* 标题 */}
                    <div className="max-w-full lg:max-w-[60%] mb-3 lg:mb-0">
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate" title={note.title}>
                            {note.title}
                        </h1>
                    </div>
                    {/* 时间、心情和天气 */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 lg:gap-0 lg:space-x-3 shrink-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {note.date.replace("2025-", "").replace("-", "-")} {note.time.slice(0, 5)}
                        </span>
                        {/* 心情显示 */}
                        {note.mood !== undefined && note.mood !== null && (
                            <div className="flex items-center space-x-1">
                                <span className="text-lg">{getMoodEmoji(note.mood)}</span>
                                <span className="text-xs text-gray-400">心情 {note.mood}/5</span>
                            </div>
                        )}
                        <WeatherIcon weather={note.weather} />
                    </div>
                </div>

                {/* 蓝色装饰线 - 移除上下间距 */}
                <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
            </div>

            {/* 信纸内容区域 */}
            <div className="flex-1 overflow-y-auto">
                {/* 信纸背景样式 - 左右留白，顶部不留白 */}
                <div className="h-full px-6 flex flex-col">
                    <div
                        className="flex-1 relative"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                transparent,
                transparent 32px,
                #e5e7eb 32px,
                #e5e7eb 33px
              )`,
                            backgroundSize: "100% 33px",
                            backgroundAttachment: "local"
                        }}
                    >
                        {/* 文字内容 - 手写体字体 */}
                        <div className="relative">
                            <div
                                className="text-gray-700 dark:text-gray-300 text-base whitespace-pre-wrap"
                                style={{
                                    lineHeight: "33px", // 与背景线条高度一致
                                    paddingBottom: "6px", // 让文字更远离横线
                                    fontFamily: "'Kalam', 'Comic Sans MS', cursive", // 手写体字体
                                }}
                            >
                                {note.content}
                            </div>
                        </div>

                        {/* 签名 - 在信纸背景上 */}
                        <div className="flex justify-end mt-6 pb-6">
                            <div className="text-right">
                                <div
                                    className="font-bold italic"
                                    style={{
                                        lineHeight: "33px",
                                        fontFamily: signature?.fontFamily || "'Kalam', 'Comic Sans MS', cursive",
                                        fontSize: getFontSizeValue(signature?.fontSize || '2xl'),
                                        color: getColorValue(signature?.color || 'gray-400'),
                                        transform: `rotate(${signature?.rotation || '12'}deg)`,
                                        display: 'inline-block'
                                    }}
                                >
                                    {signature?.signatureName || 'CodeShine'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 图片展示区域 - 移出信纸背景，在签名下方 */}
                {note.images && note.images.length > 0 && (
                    <div className="px-6 pb-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {note.images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <div className="border-2 border-red-200 dark:border-red-400 rounded-lg overflow-hidden bg-white dark:bg-gray-700 p-1">
                                        <Image
                                            src={image || "/placeholder.svg"}
                                            alt={`${note.title} - 图片 ${index + 1}`}
                                            width={150}
                                            height={100}
                                            className="w-full h-auto rounded object-cover"
                                            style={{ width: 'auto', height: 'auto' }}
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
