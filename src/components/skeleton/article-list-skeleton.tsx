"use client"

import React from "react"

export default function ArticleListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          {/* 顶部：左侧图片 + 右侧标题和时间 */}
          <div className="flex space-x-4">
            {/* 左侧图片骨架屏 */}
            <div className="w-20 h-20 flex-shrink-0">
              <div className="w-full h-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>

            {/* 右侧标题和时间骨架屏 */}
            <div className="flex-1 space-y-2">
              {/* 标题骨架屏 */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
              </div>

              {/* 时间骨架屏 */}
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* 中间：摘要骨架屏 */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
          </div>

          {/* 底部：分类标签 + 统计信息骨架屏 */}
          <div className="flex items-center justify-between pt-2">
            {/* 分类标签骨架屏 */}
            <div className="flex items-center space-x-2">
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* 统计信息骨架屏 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 