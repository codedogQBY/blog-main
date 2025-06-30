"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import InfiniteScrollLoader from "@/components/loading/infinite-scroll-loader"
import GalleryCard from "@/components/gallery/gallery-card"
import GalleryFilter from "@/components/gallery/gallery-filter"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { galleryAPI, getGalleryCategories } from "@/lib/gallery-api"
import type { GalleryItem } from "@/types/gallery"
import type { GalleryCategory } from "@/lib/gallery-api"

export default function GalleryPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<GalleryCategory[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>("全部")

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
    })

    // 加载分类数据
    const loadCategories = async () => {
        try {
            const categoryData = await getGalleryCategories({
                includeStats: true,
                enabledOnly: true
            })
            setCategories(categoryData)
        } catch (err) {
            console.error('获取分类数据失败:', err)
        }
    }

    // 重置筛选
    const resetFilters = () => {
        setSelectedCategory("全部")
    }

    // 处理图库项点击
    const handleItemClick = (item: GalleryItem) => {
        router.push(`/gallery/${item.id}`)
    }

    // 初始化加载分类数据
    useEffect(() => {
        loadCategories()
    }, [])

    // 当筛选条件改变时刷新数据
    useEffect(() => {
        refresh()
    }, [selectedCategory, refresh])

    // 计算分类选项
    const categoryOptions = useMemo(() => {
        const totalCount = items.length
        const categoryMap = new Map<string, number>()
        
        // 统计每个分类的图片数量
        items.forEach(item => {
            const category = item.category || '未分类'
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
        })

        const options = [
            { category: '全部', count: totalCount }
        ]

        // 添加分类选项
        categories.forEach(category => {
            const count = categoryMap.get(category.name) || 0
            if (count > 0) {
                options.push({
                    category: category.name,
                    count: count
                })
            }
        })

        // 添加未分类选项（如果有未分类的图片）
        const uncategorizedCount = categoryMap.get('未分类') || 0
        if (uncategorizedCount > 0) {
            options.push({
                category: '未分类',
                count: uncategorizedCount
            })
        }

        return options
    }, [items, categories])

    // 收集所有标签
    const allTags = useMemo(() => {
        const tagSet = new Set<string>()
        items.forEach(item => {
            item.tags?.forEach(tag => tagSet.add(tag))
        })
        return Array.from(tagSet).sort()
    }, [items])

    // 处理加载更多
    const handleLoadMore = async (): Promise<GalleryItem[]> => {
        await loadMore()
        return []
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="container mx-auto px-4 py-8">
                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        图库展示
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        探索精美的图片收藏，每一张都承载着独特的故事与美好的回忆
                    </p>
                </div>

                {/* 筛选器 */}
                <GalleryFilter
                    categories={categoryOptions}
                    activeCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    totalCount={items.length}
                />

                {/* 无限滚动列表 */}
                <div className="mt-8">
                    <InfiniteScrollLoader
                        items={items}
                        onLoadMore={handleLoadMore}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        renderItem={(item) => (
                            <GalleryCard
                                key={item.id}
                                item={item}
                                onClick={handleItemClick}
                            />
                        )}
                        emptyComponent={
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🖼️</div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    暂无图片
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    还没有上传任何图片，或者没有找到符合条件的图片
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    清除筛选条件
                                </button>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    )
}
