"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Palette, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { StickyNoteData } from "./sticky-note"

interface AddMessageModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (message: Omit<StickyNoteData, "id" | "date" | "likes" | "comments" | "createdAt" | "updatedAt">) => void
}

const modernColors = [
    {
        name: "Rose",
        value: "pink" as const,
        gradient: "bg-gradient-to-br from-rose-400 to-pink-500",
        preview: "from-rose-400/20 via-pink-300/15 to-rose-500/20",
    },
    {
        name: "Amber",
        value: "yellow" as const,
        gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
        preview: "from-amber-400/20 via-yellow-300/15 to-orange-400/20",
    },
    {
        name: "Ocean",
        value: "blue" as const,
        gradient: "bg-gradient-to-br from-blue-400 to-cyan-500",
        preview: "from-blue-400/20 via-cyan-300/15 to-blue-500/20",
    },
    {
        name: "Forest",
        value: "green" as const,
        gradient: "bg-gradient-to-br from-emerald-400 to-teal-500",
        preview: "from-emerald-400/20 via-green-300/15 to-teal-400/20",
    },
    {
        name: "Cosmic",
        value: "purple" as const,
        gradient: "bg-gradient-to-br from-violet-400 to-indigo-500",
        preview: "from-violet-400/20 via-purple-300/15 to-indigo-400/20",
    },
]

const categories = ["留言", "目标", "理想", "过去", "将来", "爱情", "亲情", "友情", "秘密", "信条", "无题"]

export default function AddMessageModal({ isOpen, onClose, onSubmit }: AddMessageModalProps) {
    const [content, setContent] = useState("")
    const [author, setAuthor] = useState("")
    const [selectedColor, setSelectedColor] = useState<"pink" | "yellow" | "blue" | "green" | "purple">("blue")
    const [selectedCategory, setSelectedCategory] = useState("留言")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 锁定背景滚动
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }

        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    const handleSubmit = async () => {
        if (!content.trim()) return

        setIsSubmitting(true)

        try {
            await onSubmit({
                content: content.trim(),
                author: author.trim() || "匿名",
                category: selectedCategory,
                color: selectedColor,
            })

            // Reset form
            setContent("")
            setAuthor("")
            setSelectedColor("blue")
            setSelectedCategory("留言")
        } catch (error) {
            console.error('提交留言失败:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (isSubmitting) return
        setContent("")
        setAuthor("")
        setSelectedColor("blue")
        setSelectedCategory("留言")
        onClose()
    }

    if (!isOpen) return null

    const selectedColorData = modernColors.find((c) => c.value === selectedColor)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Enhanced backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                onClick={handleClose}
                style={{
                    background: "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)",
                }}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden max-h-[90vh] flex flex-col transform transition-all duration-500 ease-out">
                {/* Animated header - 固定高度 */}
                <div className="relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
                    <header className="relative flex items-center justify-between p-6 h-[88px]">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">创建留言</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">分享你的想法</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="w-10 h-10 p-0 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-110 flex items-center justify-center"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </header>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Color selection with preview */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">选择主题</span>
                        </div>
                        <div className="flex space-x-3">
                            {modernColors.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`
                      relative w-12 h-12 rounded-2xl transition-all duration-300 group
                      ${color.gradient} shadow-lg
                      ${
                                        selectedColor === color.value
                                            ? "scale-110 ring-2 ring-white dark:ring-gray-800 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900 shadow-xl"
                                            : "hover:scale-105 hover:shadow-xl"
                                    }
                    `}
                                    title={color.name}
                                >
                                    {selectedColor === color.value && (
                                        <div className="absolute inset-0 rounded-2xl bg-white/20 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content input with live preview */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">留言内容</label>
                        <div className="relative group">
                            <div
                                className={`
        relative rounded-2xl backdrop-blur-sm transition-all duration-500
        bg-gradient-to-br ${selectedColorData?.preview}
        border border-white/30 dark:border-gray-600/30
        ${content ? "shadow-lg" : ""}
      `}
                            >
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="在这里写下你的想法..."
                                    className="
          min-h-[140px] resize-none border-0 bg-transparent p-4 text-sm w-full
          placeholder:text-gray-500 dark:placeholder:text-gray-400
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-0 focus-visible:ring-0
        "
                                    maxLength={500}
                                    style={{ boxShadow: "none" }}
                                />
                                <div className="flex items-center justify-between p-4 pt-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-white/60 dark:bg-gray-800/60 px-2 py-1 rounded-full">
                    {content.length}/500
                  </span>
                                    <div className="relative group/input">
                                        <Input
                                            value={author}
                                            onChange={(e) => setAuthor(e.target.value)}
                                            placeholder="署名"
                                            className="
              w-20 h-7 text-xs text-center rounded-lg
              bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm
              border-0
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              text-gray-900 dark:text-gray-100
              transition-all duration-300
              focus:outline-none focus:ring-0 focus-visible:ring-0
              focus:bg-white dark:focus:bg-gray-700
              focus:shadow-lg focus:shadow-blue-500/25 dark:focus:shadow-blue-400/25
              focus:scale-110
            "
                                            maxLength={10}
                                            style={{ boxShadow: "none" }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* 聚焦指示器 */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
                        </div>
                    </div>

                    {/* Category selection - 使用外部分类样式 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">选择分类</span>
                        </div>
                        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-sm p-4">
                            <div className="flex flex-wrap justify-center gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`
                      px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 transform
                      ${
                                            selectedCategory === category
                                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md scale-105"
                                                : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-105"
                                        }
                    `}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced footer */}
                <div className="p-6 border-t border-gray-100/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="flex space-x-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-2xl border-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                        >
                            取消
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || isSubmitting}
                            className={`
                  flex-1 rounded-2xl border-0 shadow-lg transition-all duration-300 transform
                  bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                  text-white hover:shadow-xl hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  ${isSubmitting ? "animate-pulse" : ""}
                `}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>发布中...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Send className="w-4 h-4" />
                                    <span>发布留言</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
