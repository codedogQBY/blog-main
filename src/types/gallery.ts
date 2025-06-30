// 图集类型（Gallery Collection）
export interface GalleryItem {
    id: string
    title: string
    description?: string
    category?: string
    tags: string[]
    coverImage?: string  // 封面图片
    images: GalleryImage[]  // 图集包含的所有图片
    status: 'published' | 'draft'
    sort: number
    createdAt: string
    updatedAt: string
    stats?: {
        likes: number
        comments: number
        imageCount: number
    }
}

// 图集中的单张图片
export interface GalleryImage {
    id: string
    title?: string
    description?: string
    imageUrl: string
    sort: number
    galleryId: string
    createdAt: string
    updatedAt: string
}

// 创建图集DTO
export interface CreateGalleryDto {
    title: string
    description?: string
    category?: string
    tags?: string[]
    coverImage?: string
    status?: 'published' | 'draft'
    images: Array<{
        title?: string
        description?: string
        imageUrl: string
        sort?: number
    }>
}

// 更新图集DTO
export interface UpdateGalleryDto {
    title?: string
    description?: string
    category?: string
    tags?: string[]
    coverImage?: string
    status?: 'published' | 'draft'
    images?: Array<{
        id?: string
        title?: string
        description?: string
        imageUrl: string
        sort?: number
    }>
}

export interface GalleryListResponse {
    items: GalleryItem[]
    total: number
    page: number
    limit: number
    hasMore: boolean
}

export interface CategoryStats {
    categories: Array<{
        category: string
        count: number
    }>
    total: number
}

export type GalleryCategory = "全部" | "人像" | "动物" | "风景" | "花花草草" | "未分类"

export interface GalleryCategoryCount {
    category: string
    count: number
}

export interface GalleryQueryParams {
    page?: number
    limit?: number
    category?: string
    search?: string
    tag?: string
    status?: 'published' | 'draft'
    sortBy?: 'createdAt' | 'title' | 'sort'
    sortOrder?: 'asc' | 'desc'
}