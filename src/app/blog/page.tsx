"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ArticleCard from "@/components/blog/article-card"
import InfiniteScrollLoader from "@/components/loading/infinite-scroll-loader"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import type { Article, ArticleCategory } from "@/types/article"
import { mockArticles } from "@/data/articles"

const categories: ArticleCategory[] = ["全部", "旅行", "总结", "产品", "技术", "生活"]

export default function ArticlesPage() {
    const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>("全部")
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchVisible, setIsSearchVisible] = useState(false)

    // 获取分类统计
    const getCategoryStats = () => {
        const stats: Record<string, number> = {}
        mockArticles.forEach((article) => {
            stats[article.category] = (stats[article.category] || 0) + 1
        })
        stats["全部"] = mockArticles.length
        return stats
    }

    const categoryStats = getCategoryStats()

    // 模拟 API 调用
    const loadArticles = useCallback(
        async (page: number, pageSize: number): Promise<Article[]> => {
            // 模拟网络延迟
            await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800))

            // 根据分类和搜索条件筛选数据
            let filteredData = mockArticles

            if (selectedCategory !== "全部") {
                filteredData = filteredData.filter((article) => article.category === selectedCategory)
            }

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                filteredData = filteredData.filter(
                    (article) =>
                        article.title.toLowerCase().includes(query) ||
                        article.excerpt.toLowerCase().includes(query) ||
                        article.tags.some((tag) => tag.toLowerCase().includes(query)),
                )
            }

            const startIndex = (page - 1) * pageSize
            const endIndex = startIndex + pageSize

            return filteredData.slice(startIndex, endIndex)
        },
        [selectedCategory, searchQuery],
    )

    // 使用无限滚动 hook
    const {
        items: articles,
        isLoading,
        hasMore,
        loadMore,
        refresh,
    } = useInfiniteScroll({
        pageSize: 9,
        loadData: loadArticles,
    })

    // 当分类或搜索条件改变时刷新数据
    useEffect(() => {
        refresh()
    }, [selectedCategory, searchQuery, refresh])

    const handleArticleClick = (article: Article) => {
        console.log("点击文章:", article.title)
        // 这里可以跳转到文章详情页
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // 搜索逻辑已经通过 useEffect 处理
    }

    // @ts-ignore
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
            <div className="pt-16">
                <main className="max-w-7xl mx-auto px-6 py-12">
                    {/* 页面头部 */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">文章</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">记录生活，分享思考，探索世界</p>
                    </div>

                    {/* 搜索和筛选 */}
                    <div className="mb-8 space-y-4">
                        {/* 搜索框 */}
                        <div className="flex justify-center">
                            <div className="relative max-w-md w-full">
                                <form onSubmit={handleSearch} className="relative">
                                    <Input
                                        type="text"
                                        placeholder="搜索文章..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 h-12 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </form>
                            </div>
                        </div>

                        {/* 分类筛选 */}
                        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-sm p-4">
                            <div className="flex flex-wrap justify-center gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`
                      px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 transform flex items-center space-x-2
                      ${
                                            selectedCategory === category
                                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md scale-105"
                                                : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-105"
                                        }
                    `}
                                    >
                                        <span>{category}</span>
                                        <span
                                            className={`
                        text-xs px-1.5 py-0.5 rounded-full
                        ${
                                                selectedCategory === category
                                                    ? "bg-white/20 text-white"
                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            }
                      `}
                                        >
                      {categoryStats[category] || 0}
                    </span>
                                    </button>
                                ))}
                            </div>

                            {/* 统计信息 */}
                            <div className="text-center mt-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {articles.length} 篇文章 {hasMore && "· 滚动加载更多"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 文章列表 */}
                    <InfiniteScrollLoader
                        items={articles}
                        onLoadMore={loadMore}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        renderItem={(article) => <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />}
                        emptyComponent={
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="text-2xl">📝</div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {searchQuery ? "未找到相关文章" : "还没有文章"}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {searchQuery ? "尝试使用其他关键词搜索" : "开始写作，分享你的想法吧！"}
                                </p>
                                {searchQuery && (
                                    <Button onClick={() => setSearchQuery("")} variant="outline" className="rounded-xl">
                                        清除搜索
                                    </Button>
                                )}
                            </div>
                        }
                    />
                </main>
            </div>
        </div>
    )
}
