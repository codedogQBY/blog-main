"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"

interface InfiniteScrollLoaderProps<T> {
    items: T[]
    onLoadMore: () => Promise<T[]>
    hasMore: boolean
    isLoading: boolean
    renderItem: (item: T, index: number) => React.ReactNode
    loadingThreshold?: number
    className?: string
    containerClassName?: string
    loadingComponent?: React.ReactNode
    emptyComponent?: React.ReactNode
    errorComponent?: React.ReactNode
}

import LoadingSpinner from './loading-spinner'

// 默认加载动画组件
const DefaultLoadingAnimation = () => {
    return <LoadingSpinner text="加载中..." />
}

export default function InfiniteScrollLoader<T>({
                                                    items,
                                                    onLoadMore,
                                                    hasMore,
                                                    isLoading,
                                                    renderItem,
                                                    loadingThreshold = 200,
                                                    className = "",
                                                    containerClassName = "",
                                                    loadingComponent,
                                                    emptyComponent,
                                                    errorComponent,
                                                }: InfiniteScrollLoaderProps<T>) {
    const [error, setError] = useState<string | null>(null)
    const loadingRef = useRef<HTMLDivElement>(null)
    const isLoadingRef = useRef(false)

    // 加载更多数据
    const loadMore = useCallback(async () => {
        if (isLoadingRef.current || !hasMore || isLoading) return

        isLoadingRef.current = true
        setError(null)

        try {
            await onLoadMore()
        } catch (err) {
            setError(err instanceof Error ? err.message : "加载失败")
        } finally {
            isLoadingRef.current = false
        }
    }, [hasMore, isLoading, onLoadMore])

    // 监听滚动事件
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && hasMore && !isLoading) {
                    loadMore()
                }
            },
            {
                rootMargin: `${loadingThreshold}px`,
                threshold: 0.1,
            },
        )

        const currentRef = loadingRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [hasMore, isLoading, loadMore, loadingThreshold])

    // 重置加载状态
    useEffect(() => {
        isLoadingRef.current = isLoading
    }, [isLoading])

    return (
        <div className={`w-full ${containerClassName}`}>
            {/* 内容列表 */}
            <div className={className}>{items.map((item, index) => renderItem(item, index))}</div>

            {/* 空状态 */}
            {items.length === 0 && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center py-12">
                    {emptyComponent || (
                        <>
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">暂无数据</p>
                        </>
                    )}
                </div>
            )}

            {/* 加载更多指示器 */}
            {items.length > 0 && (
                <div ref={loadingRef} className="w-full">
                    {isLoading && <div className="w-full">{loadingComponent || <DefaultLoadingAnimation />}</div>}

                    {/* 错误状态 */}
                    {error && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            {errorComponent || (
                                <>
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                        <div className="w-6 h-6 text-red-500">⚠️</div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-red-500 text-sm font-medium mb-2">加载失败</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">{error}</p>
                                        <button
                                            onClick={loadMore}
                                            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            重试
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* 没有更多数据 */}
                    {!hasMore && !isLoading && !error && items.length > 0 && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
                                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 max-w-16"></div>
                                <span className="text-xs font-medium px-3">没有更多了</span>
                                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 max-w-16"></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// 导出类型
export type { InfiniteScrollLoaderProps }
