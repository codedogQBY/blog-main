"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import InfiniteScrollLoader from "@/components/loading/infinite-scroll-loader"
import GalleryCard from "@/components/gallery/gallery-card"
import GalleryFilter from "@/components/gallery/gallery-filter"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { galleryAPI } from "@/lib/gallery-api"
import type { GalleryItem } from "@/types/gallery"
import type { GalleryCategory } from "@/lib/gallery-api"
import GalleryListSkeleton from "@/components/skeleton/gallery-list-skeleton"
import LoadingSpinner from "@/components/loading/loading-spinner"

interface GalleryClientProps {
  initialItems: GalleryItem[]
  categories: GalleryCategory[]
  initialCategory: string
}

export default function GalleryClient({ 
  initialItems, 
  categories, 
  initialCategory 
}: GalleryClientProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  // 加载图库数据的函数
  const loadGalleryData = useCallback(async (page: number, pageSize: number): Promise<GalleryItem[]> => {
    const response = await galleryAPI.getGalleryImages({
      page,
      limit: pageSize,
      category: selectedCategory === "全部" ? undefined : selectedCategory,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    return response.items
  }, [selectedCategory])

  // 使用无限滚动hook
  const { items, isLoading, hasMore, loadMore, refresh } = useInfiniteScroll({
    pageSize: 12,
    loadData: loadGalleryData,
    initialData: initialItems
  })

  // 监听加载状态变化，标记非首次加载
  useEffect(() => {
    if (isLoading && isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [isLoading, isFirstLoad])

  // 重置筛选
  const resetFilters = () => {
    setSelectedCategory("全部")
  }

  // 处理图库项点击
  const handleItemClick = (item: GalleryItem) => {
    router.push(`/gallery/${item.id}`)
  }

  // 当筛选条件改变时刷新数据
  useEffect(() => {
    refresh()
  }, [selectedCategory, refresh])

  // 计算分类选项
  const categoryOptions = useMemo(() => {
    let totalCount = 0
    const options = []

    // 添加分类选项
    categories.forEach(category => {
      const count = category.imageCount || 0
      if (count > 0) {
        totalCount += count
        options.push({
          category: category.name,
          count: count
        })
      }
    })

    options.unshift(
      { category: '全部', count: totalCount }
    )

    return options
  }, [categories])

  // 处理加载更多
  const handleLoadMore = async (): Promise<GalleryItem[]> => {
    await loadMore()
    return []
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 页面标题 */}
        <div className="text-center mb-10">
          <div className="relative">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 relative">
              图库展示
              <div className="absolute -top-2 -right-2 text-xl animate-bounce">📸</div>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-pink-600 to-purple-600 mx-auto rounded-full mb-4"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            每一张照片都承载着独特的故事与美好的回忆
          </p>
        </div>

        {/* 筛选器 */}
        <GalleryFilter
          categories={categoryOptions}
          activeCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalCount={items.length}
        />

        {/* 图库网格 */}
        <div className="mt-8">
          {isFirstLoad && isLoading ? (
            <GalleryListSkeleton />
          ) : (
            <InfiniteScrollLoader
              items={items}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              isLoading={isLoading}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-max"
              renderItem={(item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onClick={handleItemClick}
                />
              )}
              emptyComponent={
                <div className="col-span-full text-center py-20">
                  <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                      <div className="text-4xl opacity-50">🖼️</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    暂无图片
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    还没有上传任何图片，或者没有找到符合当前筛选条件的图片
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    清除筛选条件
                  </button>
                </div>
              }
              loadingComponent={
                <div className="col-span-full">
                  <LoadingSpinner text="加载更多图片中..." />
                </div>
              }
            />
          )}
        </div>

        {/* 快速返回顶部按钮 */}
        {items.length > 8 && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
              aria-label="返回顶部"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 