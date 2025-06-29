"use client"

import { useState, useEffect, useCallback } from "react"
import GalleryCard from "@/components/gallery/gallery-card"
import GalleryFilter from "@/components/gallery/gallery-filter"
import InfiniteScrollLoader from "@/components/loading/infinite-scroll-loader"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { fetchGalleryData, getCategoryCounts } from "@/data/gallery"
import type { GalleryItem } from "@/types/gallery"

export default function GalleryPage() {
    const [activeCategory, setActiveCategory] = useState("全部")
    const categories = getCategoryCounts()

    // 模拟 API 调用
    const loadGalleryItems = useCallback(
        async (page: number, pageSize: number): Promise<GalleryItem[]> => {
            const result = await fetchGalleryData(page, pageSize, activeCategory)
            return result.items
        },
        [activeCategory],
    )

    // 使用无限滚动 hook
    const { items, isLoading, hasMore, loadMore, refresh } = useInfiniteScroll({
        pageSize: 8,
        loadData: loadGalleryItems,
    })

    // 当分类改变时刷新数据
    useEffect(() => {
        refresh()
    }, [activeCategory, refresh])

    // 切换分类
    const handleCategoryChange = (category: string) => {
        setActiveCategory(category)
    }

    // 点击图库项
    const handleGalleryClick = (item: GalleryItem) => {
        console.log("Clicked gallery item:", item)
        // 这里可以添加查看详情的逻辑
    }

    // 创建适配器函数来匹配InfiniteScrollLoader的接口
    const handleLoadMore = async (): Promise<GalleryItem[]> => {
        await loadMore()
        return [] // InfiniteScrollLoader不使用返回值，items通过hook状态管理
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
            <div className="pt-16">
                <main className="max-w-7xl mx-auto px-6 py-12">
                    {/* 页面标题 */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">图库</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">记录生活中的美好瞬间</p>
                    </div>

                    {/* 分类筛选 */}
                    <GalleryFilter
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                        totalCount={items.length}
                    />

                    {/* 无限滚动容器 */}
                    <InfiniteScrollLoader
                        items={items}
                        onLoadMore={handleLoadMore}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        renderItem={(item) => <GalleryCard key={item.id} item={item} onClick={handleGalleryClick} />}
                        emptyComponent={
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="text-2xl">🖼️</div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">该分类下暂无图库</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">换个分类看看吧！</p>
                            </div>
                        }
                    />
                </main>
            </div>
        </div>
    )
}
