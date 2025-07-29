"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from '@/components/ui/button'
import { api } from "@/lib/api"
import type { Article } from '@/lib/api'
import ArticleCard from '@/components/blog/article-card'
import InfiniteScrollLoader from '@/components/loading/infinite-scroll-loader'
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import ArticleListSkeleton from '@/components/skeleton/article-list-skeleton'
import { useRouter } from "@bprogress/next/app"

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    articles: number;
  };
}

interface ArticleForDisplay extends Omit<Article, 'category' | 'tags' | 'author'> {
  category?: string
  tags?: string[]
  author?: string
  publishDate?: string
  comments?: number
}

interface BlogListClientProps {
  initialArticles: ArticleForDisplay[]
  categories: Category[]
  categoryStats: Record<string, number>
  displayCategories: string[]
}

export default function BlogListClient({
  initialArticles,
  categories,
  categoryStats: initialCategoryStats,
  displayCategories: initialDisplayCategories
}: BlogListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("全部")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryStats] = useState(initialCategoryStats)
  const [displayCategories] = useState(initialDisplayCategories)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const router = useRouter()

  // 加载文章数据
  const loadArticles = useCallback(
    async (page: number, pageSize: number): Promise<ArticleForDisplay[]> => {
      try {
        // 将中文分类名转换为对应的slug
        let categorySlug: string | undefined
        if (selectedCategory !== "全部") {
          const realCategory = categories.find(cat => cat.name === selectedCategory)
          categorySlug = realCategory?.slug
        }

        const response = await api.getArticles({
          page,
          limit: pageSize,
          search: searchQuery.trim() || undefined,
          category: categorySlug,
          published: true,
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
    [selectedCategory, searchQuery, categories],
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
    initialData: initialArticles
  })

  // 监听加载状态变化，标记非首次加载
  useEffect(() => {
    if (isLoading && isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [isLoading, isFirstLoad])

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
      router.push(`/blog/${article.slug}`)
    }
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
            {/* 分类筛选 */}
            <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-sm p-4">
              <div className="flex flex-wrap justify-center gap-2">
                {displayCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 transform flex items-center space-x-2 cursor-pointer
                      ${
                        selectedCategory === category
                          ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105"
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
          {isFirstLoad && isLoading ? (
            <ArticleListSkeleton />
          ) : (
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
          )}
        </main>
      </div>
    </div>
  )
}