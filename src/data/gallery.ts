import type { GalleryItem } from "@/types/gallery"

// 模拟图库数据 - 图集概念
export const mockGalleryData: GalleryItem[] = [
    {
        id: "1",
        title: "哈尔滨的冬天",
        description: "雪花纷飞的哈尔滨，古典建筑与现代都市的完美融合，每一个角落都充满了浓郁的异国风情。",
        category: "风景",
        tags: ["冬天", "雪景", "建筑"],
        coverImage: "/placeholder.svg?height=400&width=300",
        status: "published",
        sort: 0,
        images: [
            {
                id: "1-1",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "哈尔滨中央大街",
                description: "充满异国风情的中央大街",
                sort: 0,
                galleryId: "1",
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T10:00:00Z",
            },
            {
                id: "1-2", 
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "索菲亚大教堂",
                description: "雪中的索菲亚大教堂",
                sort: 1,
                galleryId: "1",
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T10:00:00Z",
            },
            {
                id: "1-3",
                imageUrl: "/placeholder.svg?height=400&width=300", 
                title: "松花江冰雪",
                description: "结冰的松花江",
                sort: 2,
                galleryId: "1",
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T10:00:00Z",
            },
            {
                id: "1-4",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "冰雪大世界",
                description: "绚烂的冰雪雕塑",
                sort: 3,
                galleryId: "1", 
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T10:00:00Z",
            },
        ],
        createdAt: "2024-01-15T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
        stats: {
            likes: 12,
            comments: 5,
            imageCount: 4,
        },
    },
    {
        id: "2",
        title: "田埂上的秋天",
        description: "秋天，回老家，一切都那么熟悉，外面很安静，今天没有安排，当光线穿过田埂的缝隙，田野也很安静，微风吹过耳边的时候我想起了，只有大自然依然强烈，秋天开的野花依然绽放...",
        category: "风景",
        tags: ["秋天", "田野", "自然"],
        coverImage: "/placeholder.svg?height=400&width=300",
        status: "published",
        sort: 1,
        images: [
            {
                id: "2-1",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "金色田野",
                description: "秋收时节的金色稻田",
                sort: 0,
                galleryId: "2",
                createdAt: "2024-02-20T10:00:00Z",
                updatedAt: "2024-02-20T10:00:00Z",
            },
            {
                id: "2-2",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "田间小径",
                description: "蜿蜒的田间小路",
                sort: 1,
                galleryId: "2",
                createdAt: "2024-02-20T10:00:00Z",
                updatedAt: "2024-02-20T10:00:00Z",
            },
            {
                id: "2-3",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "野花绽放",
                description: "路边盛开的野菊花",
                sort: 2,
                galleryId: "2",
                createdAt: "2024-02-20T10:00:00Z",
                updatedAt: "2024-02-20T10:00:00Z",
            },
        ],
        createdAt: "2024-02-20T00:00:00Z",
        updatedAt: "2024-02-20T00:00:00Z",
        stats: {
            likes: 8,
            comments: 3,
            imageCount: 3,
        },
    },
    {
        id: "3",
        title: "一副麻将和一碗年糕",
        description: "传统文化与美食的完美结合，记录生活中的温馨时刻。",
        category: "花花草草",
        tags: ["美食", "传统", "生活"],
        coverImage: "/placeholder.svg?height=400&width=300",
        status: "published", 
        sort: 2,
        images: [
            {
                id: "3-1",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "麻将桌",
                description: "精美的麻将牌",
                sort: 0,
                galleryId: "3",
                createdAt: "2024-03-10T10:00:00Z",
                updatedAt: "2024-03-10T10:00:00Z",
            },
            {
                id: "3-2",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "年糕汤",
                description: "热腾腾的年糕汤",
                sort: 1,
                galleryId: "3",
                createdAt: "2024-03-10T10:00:00Z",
                updatedAt: "2024-03-10T10:00:00Z",
            },
        ],
        createdAt: "2024-03-10T00:00:00Z",
        updatedAt: "2024-03-10T00:00:00Z",
        stats: {
            likes: 15,
            comments: 7,
            imageCount: 2,
        },
    },
    {
        id: "4",
        title: "黑白的味道",
        description: "用黑白摄影记录城市的另一面，光影交错间诉说着时间的故事。",
        category: "风景",
        tags: ["黑白", "城市", "建筑"],
        coverImage: "/placeholder.svg?height=400&width=300",
        status: "published",
        sort: 3,
        images: [
            {
                id: "4-1",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "街角光影",
                description: "黑白色调的街角", 
                sort: 0,
                galleryId: "4",
                createdAt: "2024-03-25T10:00:00Z",
                updatedAt: "2024-03-25T10:00:00Z",
            },
            {
                id: "4-2",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "建筑线条",
                description: "现代建筑的几何美",
                sort: 1,
                galleryId: "4",
                createdAt: "2024-03-25T10:00:00Z",
                updatedAt: "2024-03-25T10:00:00Z",
            },
        ],
        createdAt: "2024-03-25T00:00:00Z",
        updatedAt: "2024-03-25T00:00:00Z",
        stats: {
            likes: 6,
            comments: 2,
            imageCount: 2,
        },
    },
    {
        id: "5",
        title: "婚纱的优雅",
        description: "记录人生最美好的时刻，每一个细节都充满了爱与幸福。",
        category: "人像",
        tags: ["婚纱", "人像", "幸福"],
        coverImage: "/placeholder.svg?height=400&width=300",
        status: "published",
        sort: 4,
        images: [
            {
                id: "5-1",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "新娘特写",
                description: "美丽的新娘",
                sort: 0,
                galleryId: "5",
                createdAt: "2024-04-05T10:00:00Z",
                updatedAt: "2024-04-05T10:00:00Z",
            },
            {
                id: "5-2", 
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "婚纱全身",
                description: "优雅的婚纱造型",
                sort: 1,
                galleryId: "5",
                createdAt: "2024-04-05T10:00:00Z",
                updatedAt: "2024-04-05T10:00:00Z",
            },
            {
                id: "5-3",
                imageUrl: "/placeholder.svg?height=400&width=300",
                title: "手捧花",
                description: "精致的手捧花",
                sort: 2,
                galleryId: "5",
                createdAt: "2024-04-05T10:00:00Z",
                updatedAt: "2024-04-05T10:00:00Z",
            },
        ],
        createdAt: "2024-04-05T00:00:00Z",
        updatedAt: "2024-04-05T00:00:00Z",
        stats: {
            likes: 22,
            comments: 12,
            imageCount: 3,
        },
    },
]

// 模拟异步加载数据
export async function fetchGalleryData(
    page = 1,
    pageSize = 6,
    category = "全部",
): Promise<{ items: GalleryItem[]; hasMore: boolean; total: number }> {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 筛选数据
    const filteredData =
        category === "全部" ? mockGalleryData : mockGalleryData.filter((item) => item.category === category)

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = filteredData.slice(startIndex, endIndex)

    return {
        items,
        hasMore: endIndex < filteredData.length,
        total: filteredData.length,
    }
}

// 获取分类统计
export function getCategoryCounts(): { category: string; count: number }[] {
    const counts = mockGalleryData.reduce(
        (acc, item) => {
            acc[item.category || "未分类"] = (acc[item.category || "未分类"] || 0) + 1
            return acc
        },
        {} as Record<string, number>,
    )

    return [
        { category: "全部", count: mockGalleryData.length },
        { category: "人像", count: counts["人像"] || 0 },
        { category: "动物", count: counts["动物"] || 0 },
        { category: "风景", count: counts["风景"] || 0 },
        { category: "花花草草", count: counts["花花草草"] || 0 },
    ]
}
