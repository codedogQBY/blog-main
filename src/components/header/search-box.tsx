"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X, Command, FileText, Image, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { search, type SearchResult } from "@/lib/search-api"
import { useRouter } from "next/navigation"
import { useDebounce } from "../../hooks/use-debounce"

interface SearchBoxProps {
    className?: string
    onSelect?: () => void
}

interface CategoryConfig {
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
}

export default function SearchBox({ className = "", onSelect }: SearchBoxProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // 使用防抖的搜索值
    const debouncedSearchValue = useDebounce(searchValue, 300)

    // 分类配置
    const categoryConfig: Record<string, CategoryConfig> = {
        article: { label: "文章", icon: FileText, color: "text-blue-600 dark:text-blue-400" },
        diary: { label: "日记", icon: Calendar, color: "text-purple-600 dark:text-purple-400" },
        gallery: { label: "图库", icon: Image, color: "text-green-600 dark:text-green-400" },
    }

    const [searchResults, setSearchResults] = useState<{
        articles: SearchResult[]
        diaries: SearchResult[]
        galleries: SearchResult[]
    }>({
        articles: [],
        diaries: [],
        galleries: []
    })

    const [showSuggestions, setShowSuggestions] = useState(false)

    // 执行搜索
    useEffect(() => {
        if (debouncedSearchValue.trim()) {
            performSearch(debouncedSearchValue)
        } else {
            setSearchResults({
                articles: [],
                diaries: [],
                galleries: []
            })
            setShowSuggestions(false)
        }
    }, [debouncedSearchValue])

    const performSearch = async (query: string) => {
        setIsLoading(true)
        try {
            const results = await search(query, 3) // 每种类型最多显示3个结果
            setSearchResults(results)
            setShowSuggestions(results.total > 0)
        } catch (error) {
            console.error('搜索失败:', error)
        } finally {
            setIsLoading(false)
        }
    }

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
        if (searchValue.trim() && searchResults.articles.length + searchResults.diaries.length + searchResults.galleries.length > 0) {
            setShowSuggestions(true)
        }
    }

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchValue(value)
    }

    // 清除搜索
    const handleClear = () => {
        setSearchValue("")
        setShowSuggestions(false)
        setSearchResults({
            articles: [],
            diaries: [],
            galleries: []
        })
        inputRef.current?.focus()
    }

    // 选择搜索结果
    const handleSelectResult = (item: SearchResult) => {
        setSearchValue("")
        setShowSuggestions(false)
        handleCollapse()
        onSelect?.()
        
        // 根据类型导航到不同页面
        switch (item.type) {
            case 'article':
                router.push(`/blog/${item.slug}`)
                break
            case 'diary':
                router.push(`/diary/detail/${item.id}`)
                break
            case 'gallery':
                router.push(`/gallery/${item.id}`)
                break
        }
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
                        ? "md:w-80 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                        : "w-full md:w-52 bg-gray-100/50 hover:bg-gray-100/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
                }
                rounded-full px-4 py-2 cursor-text
            `}
                onClick={!isExpanded ? handleExpand : undefined}
            >
                {/* 搜索图标 */}
                <Search
                    className={`
                    h-4 w-4 text-gray-500 dark:text-gray-400 transition-all duration-200 flex-shrink-0
                    ${isExpanded ? "mr-3" : "mr-2"}
                    ${isLoading ? 'animate-spin' : ''}
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
                        placeholder="搜索文章/随记/图库..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
                    />
                ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400 select-none truncate">文章/随记/图库</span>
                )}

                {/* 右侧操作区 */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                    {isExpanded && searchValue && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                            <X className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        </Button>
                    )}

                    {!isExpanded && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500 ml-4">
                            <Command className="h-3 w-3" />
                            <span>K</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 搜索建议下拉框 */}
            {showSuggestions && (searchResults.articles.length > 0 || searchResults.diaries.length > 0 || searchResults.galleries.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                    <div className="py-2">
                        {/* 文章结果 */}
                        {searchResults.articles.length > 0 && (
                            <div className="mb-4 last:mb-0">
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                    <div className="flex items-center space-x-2">
                                        <FileText className={`h-4 w-4 ${categoryConfig.article.color}`} />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{categoryConfig.article.label}</span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">({searchResults.articles.length})</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {searchResults.articles.map((item) => (
                                        <button
                                            key={item.id}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
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
                        )}

                        {/* 日记结果 */}
                        {searchResults.diaries.length > 0 && (
                            <div className="mb-4 last:mb-0">
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className={`h-4 w-4 ${categoryConfig.diary.color}`} />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{categoryConfig.diary.label}</span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">({searchResults.diaries.length})</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {searchResults.diaries.map((item) => (
                                        <button
                                            key={item.id}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
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
                        )}

                        {/* 图库结果 */}
                        {searchResults.galleries.length > 0 && (
                            <div className="mb-4 last:mb-0">
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                    <div className="flex items-center space-x-2">
                                        <Image className={`h-4 w-4 ${categoryConfig.gallery.color}`} alt="图库图标" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{categoryConfig.gallery.label}</span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">({searchResults.galleries.length})</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {searchResults.galleries.map((item) => (
                                        <button
                                            key={item.id}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
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
                        )}
                    </div>

                    {/* 搜索提示 */}
                    <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                                <span>ESC 关闭</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 无结果提示 */}
            {showSuggestions && searchValue && searchResults.articles.length === 0 && searchResults.diaries.length === 0 && searchResults.galleries.length === 0 && !isLoading && (
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
