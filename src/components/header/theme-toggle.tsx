"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "./theme-provider"
import { useState } from "react"

export default function ThemeToggle() {
    const { actualTheme, setTheme } = useTheme()
    const [isAnimating, setIsAnimating] = useState(false)

    const toggleTheme = () => {
        setIsAnimating(true)
        const newTheme = actualTheme === "light" ? "dark" : "light"
        setTheme(newTheme)

        // 重置动画状态
        setTimeout(() => setIsAnimating(false), 300)
    }

    return (
        <button
            onClick={toggleTheme}
            className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out
        ${
                actualTheme === "dark"
                    ? "bg-gradient-to-r from-slate-700 to-slate-800 shadow-inner"
                    : "bg-gradient-to-r from-blue-100 to-sky-200 shadow-inner"
            }
        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900
      `}
            aria-label={`切换到${actualTheme === "light" ? "黑暗" : "明亮"}主题`}
        >
            {/* 滑块 */}
            <span
                className={`
          inline-block h-4 w-4 transform rounded-full transition-all duration-300 ease-in-out
          ${
                    actualTheme === "dark"
                        ? "translate-x-6 bg-gradient-to-br from-slate-200 to-white shadow-md"
                        : "translate-x-0.5 bg-gradient-to-br from-white to-yellow-100 shadow-md"
                }
          ${isAnimating ? "scale-110" : "scale-100"}
        `}
            >
        {/* 图标容器 */}
                <span className="flex h-full w-full items-center justify-center">
          {actualTheme === "dark" ? (
              <Moon
                  className={`h-2.5 w-2.5 text-blue-300 transition-all duration-300 ${isAnimating ? "rotate-12" : "rotate-0"}`}
              />
          ) : (
              <Sun
                  className={`h-2.5 w-2.5 text-yellow-600 transition-all duration-300 ${
                      isAnimating ? "rotate-180" : "rotate-0"
                  }`}
              />
          )}
        </span>
      </span>

            {/* 背景装饰 */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
                {actualTheme === "dark" ? (
                    // 黑暗主题：星星效果
                    <div className="absolute inset-0">
                        <div className="absolute top-0.5 left-1.5 h-0.5 w-0.5 bg-white rounded-full opacity-60"></div>
                        <div className="absolute top-1 right-2 h-0.5 w-0.5 bg-white rounded-full opacity-40"></div>
                        <div className="absolute bottom-0.5 left-2 h-0.5 w-0.5 bg-white rounded-full opacity-50"></div>
                    </div>
                ) : (
                    // 明亮主题：云朵效果
                    <div className="absolute inset-0">
                        <div className="absolute top-0.5 right-1.5 h-0.5 w-1 bg-white/30 rounded-full"></div>
                        <div className="absolute bottom-0.5 right-2.5 h-0.5 w-1 bg-white/20 rounded-full"></div>
                    </div>
                )}
            </div>
        </button>
    )
}
