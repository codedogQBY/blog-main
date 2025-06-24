"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X, Command, FileText, BookOpen, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchBoxProps {
    className?: string
}

interface SearchItem {
    title: string
    category: "article" | "essay" | "diary"
    excerpt?: string
}

interface CategoryConfig {
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
}

export default function SearchBox({ className = "" }: SearchBoxProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // 分类配置
    const categoryConfig: Record<string, CategoryConfig> = {
        article: { label: "文章", icon: FileText, color: "text-blue-600 dark:text-blue-400" },
        essay: { label: "随笔", icon: BookOpen, color: "text-green-600 dark:text-green-400" },
        diary: { label: "日记", icon: Calendar, color: "text-purple-600 dark:text-purple-400" },
    }

    // 搜索数据（按分类组织）
    const searchData: SearchItem[] = [
        { title: "React 最佳实践指南", category: "article", excerpt: "深入了解 React 开发的最佳实践" },
        { title: "Next.js 性能优化技巧", category: "article", excerpt: "提升 Next.js 应用性能的实用方法" },
        { title: "TypeScript 进阶教程", category: "article", excerpt: "掌握 TypeScript 的高级特性" },
        { title: "关于代码的思考", category: "essay", excerpt: "编程路上的一些感悟和思考" },
        { title: "设计与开发的平衡", category: "essay", excerpt: "在美观和功能之间找到平衡点" },
        { title: "学习新技术的方法", category: "essay", excerpt: "如何高效学习前端新技术" },
        { title: "今天完成了搜索功能", category: "diary", excerpt: "实现了一个很酷的搜索组件" },
        { title: "周末的编程时光", category: "diary", excerpt: "在咖啡厅里写代码的美好时光" },
        { title: "项目上线的那一刻", category: "diary", excerpt: "第一次看到自己的作品上线" },
    ]

    const [filteredResults, setFilteredResults] = useState<Record<string, SearchItem[]>>({})
    const [showSuggestions, setShowSuggestions] = useState(false)

    // 处理搜索框展开
    const handleExpand = () => {
        setIsExpanded(true)
        setTimeout(() => {
            inputRef.current?.focus()
        }, 150)
    }

    // 处理搜索框收缩
    const handleCollapse = () => {
        setIsExpanded(false)
        setShowSuggestions(false)
    }

    // 处理失焦
    const handleBlur = () => {
        setIsFocused(false)
        setTimeout(() => {
            if (!isFocused) {
                handleCollapse()
            }
        }, 200)
    }

    // 处理聚焦
    const handleFocus = () => {
        setIsFocused(true)
        if (searchValue.trim()) {
            setShowSuggestions(true)
        }
    }

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchValue(value)

        if (value.trim()) {
            const results: Record<string, SearchItem[]> = {}

            Object.keys(categoryConfig).forEach((category) => {
                const categoryResults = searchData
                    .filter(
                        (item) =>
                            item.category === category &&
                            (item.title.toLowerCase().includes(value.toLowerCase()) ||
                                item.excerpt?.toLowerCase().includes(value.toLowerCase())),
                    )
                    .slice(0, 3)

                if (categoryResults.length > 0) {
                    results[category] = categoryResults
                }
            })

            setFilteredResults(results)
            setShowSuggestions(Object.keys(results).length > 0)
        } else {
            setShowSuggestions(false)
            setFilteredResults({})
        }
    }

    // 清除搜索
    const handleClear = () => {
        setSearchValue("")
        setShowSuggestions(false)
        setFilteredResults({})
        inputRef.current?.focus()
    }

    // 选择搜索结果
    const handleSelectResult = (item: SearchItem) => {
        setSearchValue(item.title)
        setShowSuggestions(false)
        console.log("选择了:", item)
    }

    // 处理键盘事件
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault()
                handleExpand()
            }
            if (e.key === "Escape") {
                setSearchValue("")
                setShowSuggestions(false)
                inputRef.current?.blur()
                handleCollapse()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    // 点击外部收缩
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                handleCollapse()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* 搜索框容器 */}
            <div
                className={`
          relative flex items-center transition-all duration-300 ease-out
          ${
                    isExpanded
                        ? "w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                        : "w-auto bg-gray-100/50 hover:bg-gray-100/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
                }
          rounded-full px-4 py-2 cursor-text
        `}
                onClick={!isExpanded ? handleExpand : undefined}
            >
                {/* 搜索图标 */}
                <Search
                    className={`
            h-4 w-4 text-gray-500 dark:text-gray-400 transition-all duration-200
            ${isExpanded ? "mr-3" : "mr-2"}
          `}
                />

                {/* 输入框或占位文本 */}
                {isExpanded ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchValue}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="搜索文章、随笔、日记..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400 select-none">文章/随笔/日记</span>
                )}

                {/* 右侧操作区 */}
                <div className="flex items-center space-x-1">
                    {isExpanded && searchValue && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                            <X className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        </Button>
                    )}

                    {!isExpanded && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
                            <Command className="h-3 w-3" />
                            <span>K</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 分类搜索结果下拉框 */}
            {showSuggestions && Object.keys(filteredResults).length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                    <div className="py-2">
                        {Object.entries(filteredResults).map(([category, items]) => {
                            const config = categoryConfig[category]
                            const IconComponent = config.icon

                            return (
                                <div key={category} className="mb-4 last:mb-0">
                                    {/* 分类标题 */}
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                        <div className="flex items-center space-x-2">
                                            <IconComponent className={`h-4 w-4 ${config.color}`} />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.label}</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">({items.length})</span>
                                        </div>
                                    </div>

                                    {/* 分类结果 */}
                                    <div className="space-y-1">
                                        {items.map((item, index) => (
                                            <button
                                                key={`${category}-${index}`}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                                onClick={() => handleSelectResult(item)}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <Search className="h-3 w-3 text-gray-400 dark:text-gray-500 mt-1 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                                            {item.title}
                                                        </div>
                                                        {item.excerpt && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                                                {item.excerpt}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* 搜索提示 */}
                    <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>按 Enter 搜索全部结果</span>
                            <div className="flex items-center space-x-2">
                                <span>ESC 关闭</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 无结果提示 */}
            {showSuggestions && searchValue && Object.keys(filteredResults).length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p>未找到相关内容</p>
                        <p className="text-xs mt-1">尝试使用其他关键词</p>
                    </div>
                </div>
            )}
        </div>
    )
}
