export interface Article {
    id: string
    title: string
    content?: string
    excerpt: string
    coverImage?: string
    slug?: string
    publishDate?: string // 兼容老版本
    publishedAt?: string // 新版本
    category: string | {
        id: string
        name: string
        slug: string
    }
    tags: string[] | Array<{
        tag: {
            id: string
            name: string
            slug: string
        }
    }>
    comments?: number
    views: number
    readTime?: number
    author?: string | {
        id: string
        name: string
    }
    published?: boolean
    createdAt?: string
    updatedAt?: string
    _count?: {
        comments: number
    }
}

export type ArticleCategory = "全部" | "旅行" | "总结" | "产品" | "技术" | "生活"
