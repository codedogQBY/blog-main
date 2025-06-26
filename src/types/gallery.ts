export interface GalleryItem {
    id: string
    title: string
    description: string
    category: string
    images: string[]
    createdAt: string
    tags: string[]
}

export type GalleryCategory = "全部" | "人像" | "动物" | "风景" | "花花草草"

export interface GalleryCategoryCount {
    category: GalleryCategory
    count: number
}
