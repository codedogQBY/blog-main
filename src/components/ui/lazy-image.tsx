'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useInView } from '@/hooks/use-in-view'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  quality = 75,
  placeholder = 'blur',
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg?height=128&width=128'
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref as React.RefObject<HTMLDivElement>, { threshold: 0.1, rootMargin: '50px' })

  useEffect(() => {
    setCurrentSrc(src)
    setError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setError(false)
    } else {
      setError(true)
      setIsLoaded(false)
      onError?.()
    }
  }

  // 生成模糊占位符
  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#gradient)" />
    </svg>`
  ).toString('base64')}`

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`}
        style={fill ? {} : { width, height }}
      >
        <span className="text-gray-500 text-sm">图片加载失败</span>
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${isLoaded ? '' : 'img-container'}`}>
      {isInView && (
        <Image
          src={currentSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          priority={priority}
          sizes={sizes}
          quality={quality}
          loading={priority ? 'eager' : 'lazy'}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? blurDataURL : undefined}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {!isLoaded && isInView && (
        <div 
          className={`absolute inset-0 bg-gray-100 dark:bg-gray-800 ${className} shimmer`}
          style={fill ? {} : { width, height }}
        />
      )}
    </div>
  )
} 