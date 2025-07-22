import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 动态导入重组件
export const DynamicGallery = dynamic(() => import('@/components/gallery/gallery-card'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
  ssr: false
})

// export const DynamicLightbox = dynamic(() => import('@/components/gallery/lightbox'), {
//   loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
//     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
//   </div>,
//   ssr: false
// })

export const DynamicCommentSection = dynamic(() => import('@/components/blog/comment-section'), {
  loading: () => <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
})

export const DynamicFloatingActions = dynamic(() => import('@/components/blog/floating-actions'), {
  ssr: false
})

// 包装组件，提供 Suspense 边界
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 h-32 rounded" />}>
        <Component {...props} />
      </Suspense>
    )
  }
} 