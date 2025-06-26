"use client"

import type { Note } from "@/types/note"
import WeatherIcon from "./weather-icon"
import Image from "next/image"

interface NotePaperProps {
    note: Note | null
}

export default function NotePaper({ note }: NotePaperProps) {
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
            <div className="p-8 pb-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{note.title}</h1>
                    <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {note.date.replace("2025-", "").replace("-", "-")} {note.time.slice(0, 5)}
            </span>
                        <WeatherIcon weather={note.weather} />
                    </div>
                </div>

                {/* 蓝色装饰线 - 移除上下间距 */}
                <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
            </div>

            {/* 信纸内容区域 */}
            <div className="flex-1 overflow-y-auto">
                {/* 信纸背景样式 - 左右留白，顶部不留白 */}
                <div className="max-w-4xl mx-auto h-full px-8">
                    <div
                        className="relative min-h-full"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                transparent,
                transparent 35px,
                #e5e7eb 35px,
                #e5e7eb 36px
              )`,
                            backgroundSize: "100% 36px",
                        }}
                    >
                        {/* 文字内容 - 手写体字体 */}
                        <div className="relative">
                            <div
                                className="text-gray-700 dark:text-gray-300 text-base whitespace-pre-wrap"
                                style={{
                                    lineHeight: "36px", // 与背景线条高度一致
                                    paddingBottom: "10px", // 让文字更远离横线
                                    fontFamily: "'Kalam', 'Comic Sans MS', cursive", // 手写体字体
                                }}
                            >
                                {note.content}
                            </div>
                        </div>

                        {/* 签名 - 在信纸背景上 */}
                        <div className="flex justify-end mt-8 pb-8">
                            <div className="text-right">
                                <div
                                    className="text-2xl font-bold text-gray-400 dark:text-gray-500 italic transform rotate-12"
                                    style={{
                                        lineHeight: "36px",
                                        fontFamily: "'Kalam', 'Comic Sans MS', cursive",
                                    }}
                                >
                                    Yike
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 图片展示区域 - 移出信纸背景，在签名下方 */}
                {note.images && note.images.length > 0 && (
                    <div className="px-8 pb-8 max-w-4xl mx-auto">
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
