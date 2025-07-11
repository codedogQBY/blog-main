import { useEffect, useState } from 'react'

interface UseImagePreloadOptions {
  src: string
  priority?: boolean
}

export function useImagePreload({ src, priority = false }: UseImagePreloadOptions) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    
    img.onload = () => {
      setIsLoaded(true)
      setError(null)
    }
    
    img.onerror = () => {
      setError('图片加载失败')
      setIsLoaded(false)
    }
    
    // 设置图片源，开始加载
    img.src = src
    
    // 如果是优先级图片，立即开始加载
    if (priority) {
      img.loading = 'eager'
    }
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, priority])

  return { isLoaded, error }
}

// 预加载多张图片
export function useMultiImagePreload(sources: string[], priority = false) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!sources.length) return

    const loadPromises = sources.map(src => {
      return new Promise<{ src: string; loaded: boolean }>((resolve) => {
        const img = new Image()
        
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(src))
          resolve({ src, loaded: true })
        }
        
        img.onerror = () => {
          setErrors(prev => new Set(prev).add(src))
          resolve({ src, loaded: false })
        }
        
        img.src = src
        if (priority) {
          img.loading = 'eager'
        }
      })
    })

    Promise.all(loadPromises).then(() => {
      // 所有图片加载完成（无论成功或失败）
    })
  }, [sources, priority])

  return {
    loadedImages,
    errors,
    allLoaded: loadedImages.size + errors.size === sources.length,
    progress: sources.length > 0 ? (loadedImages.size + errors.size) / sources.length : 0
  }
}

// 预加载关键资源
export function usePreloadCriticalResources() {
  useEffect(() => {
    // 预加载关键图片
    const criticalImages = ['/dark.png', '/light.png']
    
    criticalImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = src
      link.as = 'image'
      document.head.appendChild(link)
    })
    
    // 预连接到CDN
    const cdnDomains = [
      'https://beal-blog-main.test.upcdn.net',
      'https://code-shine.test.upcdn.net'
    ]
    
    cdnDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      document.head.appendChild(link)
    })
  }, [])
}