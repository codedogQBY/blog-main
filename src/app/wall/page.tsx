"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import StickyNote, { type StickyNoteData } from "@/components/wall/sticky-note"
import AddMessageModal from "@/components/wall/add-message-modal"
import MessageDetailModal from "@/components/wall/message-detail-modal"
import InfiniteScrollLoader from "@/components/loading/infinite-scroll-loader"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

// 模拟数据
const allMessages: StickyNoteData[] = [
    {
        id: "1",
        content:
            "您好！我是一名应届毕业生在6b站看到您的网站风格很棒。我会跟着您的视频制作网站，但是不会商业化。希望您考虑做一个网站并部署上线，作为自己的项目经验。希望您能同意。谢谢！",
        author: "匿名",
        date: "06/22 01:12",
        category: "留言",
        color: "pink",
        likes: 0,
        comments: 1,
    },
    {
        id: "2",
        content: "人生的意义是什么",
        author: "darker",
        date: "06/20 11:30",
        category: "留言",
        color: "purple",
        likes: 1,
        comments: 0,
    },
    {
        id: "3",
        content: "您好！我特别喜欢您网站的设计风格。想参考您做自己的网站，可以吗？我会自己调整细节的。谢谢啦！",
        author: "dasher",
        date: "06/19 10:27",
        category: "理想",
        color: "pink",
        likes: 0,
        comments: 1,
    },
    {
        id: "4",
        content: "2025年6月19日\n天气晴\n跟up跟到mock数据了，但是引入mock后页面白屏，还没找到原因。呜呜～",
        author: "嘿嘿",
        date: "06/19 09:47",
        category: "留言",
        color: "yellow",
        likes: 2,
        comments: 0,
    },
    {
        id: "5",
        content: "会留下记忆吗",
        author: "嘿嘿",
        date: "06/17 15:36",
        category: "留言",
        color: "blue",
        likes: 1,
        comments: 0,
    },
    {
        id: "6",
        content: "开始学习",
        author: "null",
        date: "06/14 08:32",
        category: "留言",
        color: "green",
        likes: 1,
        comments: 0,
    },
    {
        id: "7",
        content:
            "这个留言这个界面的技术很好，我以为是真的。哈哈哈。然后上面朋友分享了。\n看完了，给了我很多感悟。谢谢日记介绍写得好。照片拍得太棒了",
        author: "勿勿那年",
        date: "06/10 16:07",
        category: "留言",
        color: "purple",
        likes: 4,
        comments: 1,
    },
    {
        id: "8",
        content: "晚拜大神，小白从0开始学",
        author: "林树峰",
        date: "06/06 20:09",
        category: "留言",
        color: "pink",
        likes: 1,
        comments: 0,
    },
    {
        id: "9",
        content: "我想做个游戏，关于亲情和爱情，用ocos。有没有大佬推荐学学，像素风昨晚",
        author: "匿名",
        date: "06/05 07:27",
        category: "留言",
        color: "blue",
        likes: 2,
        comments: 0,
    },
    {
        id: "10",
        content: "毕业季不说再见，现代码可以改变给我吗",
        author: "匿名",
        date: "06/29 14:56",
        category: "留言",
        color: "green",
        likes: 3,
        comments: 1,
    },
    // 添加更多模拟数据用于测试分页
    ...Array.from({ length: 50 }, (_, i) => ({
        id: `mock-${i + 11}`,
        content: `这是第 ${i + 11} 条模拟留言内容，用于测试无限滚动加载功能。`,
        author: `用户${i + 11}`,
        date: `06/${String(Math.floor(Math.random() * 30) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        category: ["留言", "目标", "理想", "过去", "将来"][Math.floor(Math.random() * 5)],
        color: ["pink", "yellow", "blue", "green", "purple"][Math.floor(Math.random() * 5)] as
            | "pink"
            | "yellow"
            | "blue"
            | "green"
            | "purple",
        likes: Math.floor(Math.random() * 10),
        comments: Math.floor(Math.random() * 5),
    })),
]

const categories = ["全部", "留言", "目标", "理想", "过去", "将来", "爱情", "亲情", "友情", "秘密", "信条", "无题"]

export default function MessagesPage() {
    const [selectedCategory, setSelectedCategory] = useState("全部")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState<StickyNoteData | null>(null)
    const [columns, setColumns] = useState<StickyNoteData[][]>([[], [], [], []])

    // 模拟 API 调用
    const loadMessages = useCallback(
        async (page: number, pageSize: number): Promise<StickyNoteData[]> => {
            // 模拟网络延迟
            await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

            // 根据分类筛选数据
            const filteredData =
                selectedCategory === "全部" ? allMessages : allMessages.filter((msg) => msg.category === selectedCategory)

            const startIndex = (page - 1) * pageSize
            const endIndex = startIndex + pageSize

            return filteredData.slice(startIndex, endIndex)
        },
        [selectedCategory],
    )

    // 使用无限滚动 hook
    const {
        items: messages,
        isLoading,
        hasMore,
        loadMore,
        refresh,
        addItem,
        updateItem,
    } = useInfiniteScroll({
        pageSize: 8,
        loadData: loadMessages,
    })

    // 当分类改变时刷新数据
    useEffect(() => {
        refresh()
    }, [selectedCategory, refresh])

    // 优化的瀑布流布局算法
    useEffect(() => {
        const getColumnCount = () => {
            if (typeof window === "undefined") return 4
            const width = window.innerWidth
            if (width < 768) return 1 // mobile
            if (width < 1024) return 2 // tablet
            if (width < 1280) return 3 // desktop
            return 4 // large desktop
        }

        const columnCount = getColumnCount()
        const newColumns: StickyNoteData[][] = Array.from({ length: columnCount }, () => [])

        // 估算每个卡片的高度（基于内容长度）
        const estimateCardHeight = (message: StickyNoteData) => {
            const baseHeight = 200 // 基础高度
            const contentHeight = Math.ceil(message.content.length / 50) * 20 // 根据内容长度估算
            const authorHeight = 40 // 作者信息高度
            const paddingHeight = 60 // 内边距
            return baseHeight + contentHeight + authorHeight + paddingHeight
        }

        // 跟踪每列的累计高度
        const columnHeights = new Array(columnCount).fill(0)

        // 将每个消息分配到高度最小的列
        messages.forEach((message) => {
            const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
            newColumns[shortestColumnIndex].push(message)
            columnHeights[shortestColumnIndex] += estimateCardHeight(message) + 24 // 24px gap
        })

        setColumns(newColumns)
    }, [messages])

    const handleAddMessage = (newMessage: Omit<StickyNoteData, "id" | "date" | "likes" | "comments">) => {
        const message: StickyNoteData = {
            ...newMessage,
            id: Date.now().toString(),
            date: new Date()
                .toLocaleDateString("zh-CN", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                })
                .replace(/\//g, "/")
                .replace(",", ""),
            likes: 0,
            comments: 0,
        }

        addItem(message)
    }

    const handleLike = (id: string) => {
        updateItem(
            (message) => message.id === id,
            (message) => ({ ...message, likes: message.likes + 1 }),
        )
    }

    const handleComment = (id: string) => {
        const note = messages.find((msg) => msg.id === id)
        if (note) {
            setSelectedNote(note)
            setIsDetailModalOpen(true)
        }
    }

    // 点击便利贴打开详情
    const handleNoteClick = (note: StickyNoteData) => {
        setSelectedNote(note)
        setIsDetailModalOpen(true)
    }

    // 渲染单个便签
    const renderStickyNote = (message: StickyNoteData) => (
        <StickyNote
            key={message.id}
            note={message}
            onLike={handleLike}
            onComment={handleComment}
            onClick={handleNoteClick}
        />
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
            <div className="pt-16">
                <main className="max-w-7xl mx-auto px-6 py-12">
                    {/* 页面头部 */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">留言墙</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">很多事情值得记录，当然也值得回忆。</p>
                    </div>

                    {/* 分类筛选 */}
                    <div className="relative mb-12">
                        {/* 主容器 */}
                        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-sm p-4">
                            {/* 分类按钮 */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`
                      px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 transform
                      ${
                                            selectedCategory === category
                                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md scale-105"
                                                : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-105"
                                        }
                    `}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            {/* 简洁的统计信息 */}
                            <div className="text-center mt-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {messages.length} 条留言 {hasMore && "· 滚动加载更多"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 无限滚动容器 */}
                    <InfiniteScrollLoader
                        items={columns}
                        onLoadMore={loadMore}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                        renderItem={(column, columnIndex) => (
                            <div key={columnIndex} className="space-y-6">
                                {column.map(renderStickyNote)}
                            </div>
                        )}
                        emptyComponent={
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="text-2xl">📝</div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">还没有留言</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">成为第一个留言的人吧！</p>
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    写下第一条留言
                                </Button>
                            </div>
                        }
                    />

                    {/* 添加留言按钮 */}
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                    >
                        <Plus className="h-5 w-5" />
                    </Button>

                    {/* 添加留言弹窗 */}
                    <AddMessageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddMessage} />

                    {/* 留言详情弹窗 */}
                    <MessageDetailModal
                        isOpen={isDetailModalOpen}
                        onClose={() => {
                            setIsDetailModalOpen(false)
                            setSelectedNote(null)
                        }}
                        note={selectedNote}
                        onLike={handleLike}
                    />
                </main>
            </div>
        </div>
    )
}
