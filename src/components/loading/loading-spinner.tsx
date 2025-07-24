"use client"

import React from "react"

interface LoadingSpinnerProps {
  text?: string
  className?: string
}

export default function LoadingSpinner({ text = "加载中...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 space-y-4 ${className}`}>
      {/* 加载动画 - 两个跳跃的圆点 */}
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-gray-800 dark:bg-gray-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      </div>

      {/* 加载文字 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{text}</p>
    </div>
  )
} 