"use client"

import { useEffect, useState, useCallback } from "react"
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from "@/lib/api"
import type { Article } from '@/lib/api'
import ArticleCard from '@/components/blog/article-card'
import InfiniteScrollLoader from '@/components/loading/infinite-scroll-loader'
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

// 创建一个兼容的显示类型
interface ArticleForDisplay extends Omit<Article, 'category' | 'tags' | 'author'> {
    category?: string
    tags?: string[]
    author?: string
    publishDate?: string
    comments?: number
}

interface Category {
    id: string;
    name: string;
    slug: string;
    _count?: {
        articles: number;
    };
}

export default function ArticlesPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("全部")
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryStats, setCategoryStats] = useState<Record<string, number>>({})
    const [realCategories, setRealCategories] = useState<Category[]>([])
    const [displayCategories, setDisplayCategories] = useState<string[]>(["全部"])

    // 获取分类数据
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.getCategories({ limit: 100 })
                setRealCategories(response.data)
                
                // 计算分类统计
                const stats: Record<string, number> = { "全部": 0 }
                const categoryNames = ["全部"]
                
                response.data.forEach((category) => {
                    const articleCount = category._count?.articles || 0
                    stats[category.name] = articleCount
                    stats["全部"] += articleCount
                    categoryNames.push(category.name)
                })
                
                setCategoryStats(stats)
                setDisplayCategories(categoryNames)
            } catch (error) {
                console.error('获取分类失败:', error)
                // 使用默认统计和分类
                setCategoryStats({ "全部": 0 })
                setDisplayCategories(["全部"])
            }
        }

        fetchCategories()
    }, [])

    // 加载文章数据
    const loadArticles = useCallback(
        async (page: number, pageSize: number): Promise<ArticleForDisplay[]> => {
            try {
                // 将中文分类名转换为对应的slug
                let categorySlug: string | undefined
                if (selectedCategory !== "全部") {
                    const realCategory = realCategories.find(cat => cat.name === selectedCategory)
                    categorySlug = realCategory?.slug
                }

                const response = await api.getArticles({
                    page,
                    limit: pageSize,
                    search: searchQuery.trim() || undefined,
                    category: categorySlug,
                })

                // 转换API数据格式以兼容现有组件
                return response.data.map(article => ({
                    ...article,
                    publishDate: article.publishedAt || article.createdAt,
                    category: typeof article.category === 'object' ? article.category.name : article.category,
                    tags: Array.isArray(article.tags) 
                        ? article.tags.map(t => typeof t === 'string' ? t : t.tag.name)
                        : [],
                    comments: article._count?.comments || 0,
                    author: typeof article.author === 'object' ? article.author.name : article.author,
                    coverImage: article.coverImage || "/placeholder.svg?height=128&width=128",
                }))
            } catch (error) {
                console.error('加载文章失败:', error)
                return []
            }
        },
        [selectedCategory, searchQuery, realCategories],
    )

    // 使用无限滚动 hook
    const {
        items: articles,
        isLoading,
        hasMore,
        loadMore,
        refresh,
    } = useInfiniteScroll<ArticleForDisplay>({
        pageSize: 9,
        loadData: loadArticles,
    })

    // 当分类或搜索条件改变时刷新数据
    useEffect(() => {
        const refreshData = async () => {
            await refresh()
        }
        refreshData()
    }, [selectedCategory, searchQuery, refresh])

    // 创建适配器函数来匹配InfiniteScrollLoader的接口
    const handleLoadMore = async (): Promise<ArticleForDisplay[]> => {
        await loadMore()
        return [] // InfiniteScrollLoader不使用返回值，items通过hook状态管理
    }

    const handleArticleClick = async (article: ArticleForDisplay) => {
        console.log("点击文章:", article.title)
        
        // 增加浏览量
        if (article.id) {
            try {
                await api.incrementArticleViews(article.id)
            } catch (error) {
                console.error('更新浏览量失败:', error)
            }
        }
        
        // 跳转到文章详情页
        if (article.slug) {
            window.location.href = `/blog/${article.slug}`
        }
    }

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // 搜索逻辑已经通过 useEffect 处理
    }

    return (
        <div className="min-h-screen">
            <div className="pt-20">
                <main className="max-w-7xl mx-auto px-6 py-12">
                    {/* 页面头部 */}
                    <div className="text-center mb-10">
                        <div className="relative">
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 relative">
                                文章
                                <div className="absolute -top-2 -right-2 text-xl animate-bounce">✍️</div>
                            </h1>
                            <div className="w-16 h-1 bg-gradient-to-r from-pink-600 to-purple-600 mx-auto rounded-full mb-4"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            记录生活，分享思考，探索世界
                        </p>
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
                                {displayCategories.map((category) => (
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
                        onLoadMore={handleLoadMore}
                        renderItem={(article, index) => (
                            <ArticleCard
                                key={article.id || index}
                                article={article}
                                onClick={() => handleArticleClick(article)}
                            />
                        )}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        isLoading={isLoading}
                        hasMore={hasMore}
                        emptyComponent={
                            <div className="col-span-full text-center py-12">
                                <div className="text-gray-400 text-lg mb-2">🔍</div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchQuery
                                        ? `没有找到包含 "${searchQuery}" 的文章`
                                        : selectedCategory !== "全部"
                                        ? `"${selectedCategory}" 分类下暂无文章`
                                        : "暂无文章"}
                                </p>
                                {searchQuery && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchQuery("")}
                                        className="mt-4"
                                    >
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
