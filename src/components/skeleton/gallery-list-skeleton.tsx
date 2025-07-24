"use client"

import React from "react"

export default function GalleryListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-max">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 bg-white dark:bg-gray-800">
          {/* 图片容器骨架屏 */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
            
            {/* 图片计数器骨架屏（右下角） */}
            <div className="absolute bottom-3 right-3 z-10">
              <div className="w-8 h-6 bg-black/70 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* 默认信息层骨架屏 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent">
            <div className="p-4 pt-8">
              {/* 分类标签骨架屏 */}
              <div className="mb-2">
                <div className="w-16 h-5 bg-blue-500/90 rounded-full animate-pulse"></div>
              </div>
              
              {/* 标题骨架屏 */}
              <div className="space-y-1">
                <div className="h-5 bg-white/90 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-white/80 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>

          {/* 详情信息遮罩骨架屏 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-3">
              {/* 标题骨架屏 */}
              <div>
                <div className="h-6 bg-white/90 rounded animate-pulse w-3/4 mb-2"></div>
                <div className="w-20 h-5 bg-blue-500/90 rounded-full animate-pulse"></div>
              </div>

              {/* 描述骨架屏 */}
              <div className="space-y-2">
                <div className="h-3 bg-white/90 rounded animate-pulse w-full"></div>
                <div className="h-3 bg-white/90 rounded animate-pulse w-4/5"></div>
              </div>
              
              {/* 图片信息骨架屏 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white/80 rounded animate-pulse"></div>
                  <div className="w-12 h-3 bg-white/80 rounded animate-pulse"></div>
                </div>
                <div className="w-16 h-3 bg-white/80 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 