import { useState, useEffect, RefObject } from 'react'

interface UseInViewOptions {
  threshold?: number | number[]
  rootMargin?: string
  root?: Element | null
}

export function useInView<T extends Element = Element>(
  ref: RefObject<T>,
  options: UseInViewOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false)
  const { threshold = 0, rootMargin = '0px', root = null } = options

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        threshold,
        rootMargin,
        root,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, threshold, rootMargin, root])

  return isInView
} 