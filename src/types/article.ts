export interface Article {
    id: string
    title: string
    excerpt: string
    coverImage: string
    publishDate: string
    category: string
    tags: string[]
    comments: number
    views: number
    readTime?: number
    author?: string
}

export type ArticleCategory = "全部" | "旅行" | "总结" | "产品" | "技术" | "生活"
