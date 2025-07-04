"use client"

import { Calendar, MessageCircle, Eye } from "lucide-react"
import Image from "next/image"
import type { Article } from "@/types/article"

interface ArticleCardProps {
    article: Article
    onClick?: (article: Article) => void
}

const categoryColors: Record<string, string> = {
    旅行: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    总结: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    产品: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    技术: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    生活: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    设计: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
}

// 格式化时间
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function ArticleCard({ article, onClick }: ArticleCardProps) {
    const handleClick = () => {
        onClick?.(article)
    }

    return (
        <article
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer p-6 space-y-4"
            onClick={handleClick}
        >
            {/* 顶部：左侧图片 + 右侧标题和时间 */}
            <div className="flex space-x-4">
                {/* 左侧图片 */}
                <div className="w-20 h-20 flex-shrink-0">
                    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        <Image
                            src={article.coverImage || "/placeholder.svg"}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="80px"
                        />
                    </div>
                </div>

                {/* 右侧标题和时间 */}
                <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 text-lg leading-tight">
                        {article.title}
                    </h3>

                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <time>{formatDate(article.publishDate)}</time>
                    </div>
                </div>
            </div>

            {/* 中间：摘要 */}
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">{article.excerpt}</p>

            {/* 底部：分类标签 + 统计信息 */}
            <div className="flex items-center justify-between pt-2">
                {/* 分类标签 */}
                <div className="flex items-center space-x-2">
          <span
              className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${categoryColors[typeof article.category === 'string' ? article.category : article.category?.name || ''] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}
            `}
          >
            {typeof article.category === 'string' ? article.category : article.category?.name || ''}
          </span>
                    {article.tags && article.tags.length > 0 && (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                            / {typeof article.tags[0] === 'string' ? article.tags[0] : article.tags[0]?.tag?.name || ''}
                        </span>
                    )}
                </div>

                {/* 统计信息 */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{article.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views}</span>
                    </div>
                </div>
            </div>
        </article>
    )
}
