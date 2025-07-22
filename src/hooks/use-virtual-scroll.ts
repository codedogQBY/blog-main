import { useState, useEffect, useRef, useMemo } from 'react'

interface UseVirtualScrollOptions<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface UseVirtualScrollReturn<T> {
  virtualItems: Array<{
    index: number
    item: T
    offsetTop: number
    height: number
  }>
  totalHeight: number
  startIndex: number
  endIndex: number
  scrollTop: number
  setScrollTop: (scrollTop: number) => void
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: UseVirtualScrollOptions<T>): UseVirtualScrollReturn<T> {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight])

  const startIndex = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    return Math.max(0, start - overscan)
  }, [scrollTop, itemHeight, overscan])

  const endIndex = useMemo(() => {
    const end = Math.ceil((scrollTop + containerHeight) / itemHeight)
    return Math.min(items.length - 1, end + overscan)
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length])

  const virtualItems = useMemo(() => {
    const virtualItems: Array<{
      index: number
      item: T
      offsetTop: number
      height: number
    }> = []

    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight,
        height: itemHeight
      })
    }

    return virtualItems
  }, [startIndex, endIndex, items, itemHeight])

  // const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
  //   setScrollTop(event.currentTarget.scrollTop)
  // }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const scrollHandler = (event: Event) => {
        const target = event.target as HTMLDivElement
        setScrollTop(target.scrollTop)
      }
      container.addEventListener('scroll', scrollHandler)
      return () => container.removeEventListener('scroll', scrollHandler)
    }
  }, [])

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollTop,
    setScrollTop
  }
} 