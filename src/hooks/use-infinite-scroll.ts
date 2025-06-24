"use client"

import { useState, useCallback } from "react"

interface UseInfiniteScrollOptions<T> {
    initialData?: T[]
    pageSize?: number
    loadData: (page: number, pageSize: number) => Promise<T[]>
}

interface UseInfiniteScrollReturn<T> {
    items: T[]
    isLoading: boolean
    hasMore: boolean
    error: string | null
    loadMore: () => Promise<void>
    refresh: () => Promise<void>
    addItem: (item: T) => void
    removeItem: (predicate: (item: T) => boolean) => void
    updateItem: (predicate: (item: T) => boolean, updater: (item: T) => T) => void
}

export function useInfiniteScroll<T>({
                                         initialData = [],
                                         pageSize = 10,
                                         loadData,
                                     }: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
    const [items, setItems] = useState<T[]>(initialData)
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return

        setIsLoading(true)
        setError(null)

        try {
            const newItems = await loadData(currentPage, pageSize)

            if (newItems.length === 0) {
                setHasMore(false)
            } else {
                setItems((prev) => [...prev, ...newItems])
                setCurrentPage((prev) => prev + 1)

                // 如果返回的数据少于页面大小，说明没有更多数据了
                if (newItems.length < pageSize) {
                    setHasMore(false)
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "加载失败"
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, pageSize, loadData, isLoading, hasMore])

    const refresh = useCallback(async () => {
        setItems([])
        setCurrentPage(1)
        setHasMore(true)
        setError(null)

        setIsLoading(true)
        try {
            const newItems = await loadData(1, pageSize)
            setItems(newItems)
            setCurrentPage(2)

            if (newItems.length < pageSize) {
                setHasMore(false)
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "刷新失败"
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [loadData, pageSize])

    const addItem = useCallback((item: T) => {
        setItems((prev) => [item, ...prev])
    }, [])

    const removeItem = useCallback((predicate: (item: T) => boolean) => {
        setItems((prev) => prev.filter((item) => !predicate(item)))
    }, [])

    const updateItem = useCallback((predicate: (item: T) => boolean, updater: (item: T) => T) => {
        setItems((prev) => prev.map((item) => (predicate(item) ? updater(item) : item)))
    }, [])

    return {
        items,
        isLoading,
        hasMore,
        error,
        loadMore,
        refresh,
        addItem,
        removeItem,
        updateItem,
    }
}
