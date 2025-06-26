"use client"

interface GalleryFilterProps {
    categories: { category: string; count: number }[]
    activeCategory: string
    onCategoryChange: (category: string) => void
    totalCount?: number
}

export default function GalleryFilter({
                                          categories,
                                          activeCategory,
                                          onCategoryChange,
                                          totalCount,
                                      }: GalleryFilterProps) {
    return (
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-sm p-4 mb-8">
            {/* 分类按钮 */}
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map(({ category, count }) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`
              px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 transform flex items-center space-x-2
              ${
                            activeCategory === category
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md scale-105"
                                : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-105"
                        }
            `}
                    >
                        <span>{category}</span>
                        <span
                            className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${
                                activeCategory === category
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }
              `}
                        >
              {count}
            </span>
                    </button>
                ))}
            </div>

            {/* 统计信息 */}
            <div className="text-center mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{totalCount} 个图库 · 滚动加载更多</p>
            </div>
        </div>
    )
}
