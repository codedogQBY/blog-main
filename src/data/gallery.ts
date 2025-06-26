import type { GalleryItem } from "@/types/gallery"

// 模拟图库数据
export const mockGalleryData: GalleryItem[] = [
    {
        id: "1",
        title: "哈尔滨的冬天",
        description: "雪花纷飞的哈尔滨，古典建筑与现代都市的完美融合，每一个角落都充满了浓郁的异国风情。",
        category: "风景",
        images: [
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
        ],
        createdAt: "2024-01-15",
        tags: ["冬天", "雪景", "建筑"],
    },
    {
        id: "2",
        title: "田埂上的秋天",
        description:
            "秋天，回老家，一切都那么熟悉，外面很安静，今天没有安排，当光线穿过田埂的缝隙，田野也很安静，微风吹过耳边的时候我想起了，只有大自然依然强烈，秋天开的野花依然绽放，田...",
        category: "风景",
        images: [
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
        ],
        createdAt: "2024-02-20",
        tags: ["秋天", "田野", "自然"],
    },
    {
        id: "3",
        title: "一副麻将和一碗年糕",
        description: "传统文化与美食的完美结合，记录生活中的温馨时刻。",
        category: "花花草草",
        images: ["/placeholder.svg?height=400&width=300", "/placeholder.svg?height=400&width=300"],
        createdAt: "2024-03-10",
        tags: ["美食", "传统", "生活"],
    },
    {
        id: "4",
        title: "黑白的味道",
        description: "用黑白摄影记录城市的另一面，光影交错间诉说着时间的故事。",
        category: "风景",
        images: [
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
        ],
        createdAt: "2024-03-25",
        tags: ["黑白", "城市", "建筑"],
    },
    {
        id: "5",
        title: "婚纱的优雅",
        description: "记录人生最美好的时刻，每一个细节都充满了爱与幸福。",
        category: "人像",
        images: [
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
        ],
        createdAt: "2024-04-05",
        tags: ["婚纱", "人像", "幸福"],
    },
    {
        id: "6",
        title: "日落时分",
        description: "夕阳西下，天空被染成金黄色，这是一天中最美的时刻。",
        category: "风景",
        images: [
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
        ],
        createdAt: "2024-04-12",
        tags: ["日落", "天空", "金黄"],
    },
    {
        id: "7",
        title: "都市夜景",
        description: "城市的夜晚总是那么迷人，霓虹灯闪烁，车水马龙。",
        category: "风景",
        images: [
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
        ],
        createdAt: "2024-04-18",
        tags: ["夜景", "城市", "霓虹"],
    },
    {
        id: "8",
        title: "小猫的午后",
        description: "慵懒的午后阳光下，小猫咪安静地打盹，岁月静好。",
        category: "动物",
        images: ["/placeholder.svg?height=400&width=300"],
        createdAt: "2024-04-22",
        tags: ["猫咪", "午后", "阳光"],
    },
    {
        id: "9",
        title: "街头人像",
        description: "捕捉街头最真实的表情，每个人都有自己的故事。",
        category: "人像",
        images: ["/placeholder.svg?height=400&width=300", "/placeholder.svg?height=400&width=300"],
        createdAt: "2024-04-28",
        tags: ["街头", "人像", "真实"],
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
            acc[item.category] = (acc[item.category] || 0) + 1
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
