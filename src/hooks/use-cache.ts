import { useState, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface UseCacheOptions {
  ttl?: number // 缓存时间（毫秒）
  maxSize?: number // 最大缓存条目数
}

export function useCache<T>(key: string, options: UseCacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options // 默认5分钟缓存
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 清理过期缓存
  const cleanupExpired = () => {
    const now = Date.now()
    const cache = cacheRef.current
    
    for (const [cacheKey, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(cacheKey)
      }
    }
  }

  // 限制缓存大小
  const limitCacheSize = () => {
    const cache = cacheRef.current
    if (cache.size > maxSize) {
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toDelete = entries.slice(0, cache.size - maxSize)
      toDelete.forEach(([key]) => cache.delete(key))
    }
  }

  const get = (): T | null => {
    cleanupExpired()
    const entry = cacheRef.current.get(key)
    return entry ? entry.data : null
  }

  const set = (value: T, customTtl?: number) => {
    cleanupExpired()
    limitCacheSize()
    
    cacheRef.current.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: customTtl || ttl
    })
  }

  const remove = () => {
    cacheRef.current.delete(key)
  }

  const clear = () => {
    cacheRef.current.clear()
  }

  const has = (): boolean => {
    cleanupExpired()
    return cacheRef.current.has(key)
  }

  // 异步获取数据，支持缓存
  const fetchWithCache = async (
    fetcher: () => Promise<T>,
    customTtl?: number
  ): Promise<T> => {
    // 检查缓存
    const cached = get()
    if (cached !== null) {
      return cached
    }

    // 获取新数据
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetcher()
      set(result, customTtl)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    get,
    set,
    remove,
    clear,
    has,
    fetchWithCache
  }
} 