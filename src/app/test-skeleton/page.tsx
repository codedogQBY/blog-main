"use client"

import { useState } from "react"
import ArticleListSkeleton from "@/components/skeleton/article-list-skeleton"
import GalleryListSkeleton from "@/components/skeleton/gallery-list-skeleton"
import LoadingSpinner from "@/components/loading/loading-spinner"

export default function TestSkeletonPage() {
  const [showSkeleton, setShowSkeleton] = useState(true)

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">骨架屏测试页面</h1>
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {showSkeleton ? "隐藏骨架屏" : "显示骨架屏"}
          </button>
        </div>

        <div className="space-y-12">
          {/* 文章列表骨架屏测试 */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">文章列表骨架屏</h2>
            {showSkeleton ? (
              <ArticleListSkeleton />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">文章列表内容</p>
              </div>
            )}
          </div>

          {/* 图库列表骨架屏测试 */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">图库列表骨架屏</h2>
            {showSkeleton ? (
              <GalleryListSkeleton />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">图库列表内容</p>
              </div>
            )}
          </div>

          {/* 加载效果测试 */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">加载效果</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <LoadingSpinner text="加载中..." />
              <LoadingSpinner text="加载更多图片中..." />
              <LoadingSpinner text="加载更多文章中..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 