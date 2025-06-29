export interface ArticleCategory {
    id: string
    name: string
    slug: string
    description?: string
    color?: string
    _count?: {
        articles: number
    }
}

export interface ArticleTag {
    id: string
    name: string
    slug: string
}

export interface Article {
    id: string
    title: string
    content: string
    excerpt: string
    slug: string
    published: boolean
    publishedAt?: string
    createdAt: string
    updatedAt: string
    views: number
    readTime?: number
    coverImage?: string
    author?: string | { id: string; name: string }
    category?: string | ArticleCategory
    tags?: string[] | { tag: ArticleTag }[]
    _count?: {
        comments: number
    }
    publishDate?: string
    comments?: number
}
