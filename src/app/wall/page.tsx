"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import StickyNote from "@/components/wall/sticky-note"
import AddMessageModal from "@/components/wall/add-message-modal"
import MessageDetailModal from "@/components/wall/message-detail-modal"
import InfiniteScrollLoader from "@/components/loading/infinite-scroll-loader"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { getStickyNotes, getStickyNoteCategories, type StickyNoteData, type CreateStickyNoteData, createStickyNote } from "@/lib/sticky-note-api"
import { toggleLike, addComment, getInteractionStats } from "@/lib/interaction-api"
import { getOrGenerateFingerprint, collectUserInfo } from "@/lib/fingerprint"

export default function MessagesPage() {
    const [selectedCategory, setSelectedCategory] = useState("全部")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState<StickyNoteData | null>(null)
    const [columns, setColumns] = useState<StickyNoteData[][]>([[], [], [], []])
    const [categories, setCategories] = useState<string[]>(["全部", "留言", "目标", "理想", "过去", "将来"])
    const [fingerprint, setFingerprint] = useState<string>("")

    // 获取用户指纹
    useEffect(() => {
        const initFingerprint = async () => {
            try {
                const fp = await getOrGenerateFingerprint()
                setFingerprint(fp)
            } catch (error) {
                console.error('获取指纹失败:', error)
            }
        }
        initFingerprint()
    }, [])

    // 加载留言数据
    const loadMessages = useCallback(
        async (page: number, pageSize: number): Promise<StickyNoteData[]> => {
            try {
                const response = await getStickyNotes({
                    page,
                    limit: pageSize,
                    category: selectedCategory
                })
                
                // 如果有用户指纹，获取每个留言的点赞状态
                if (fingerprint) {
                    const messagesWithLikeStatus = await Promise.all(
                        response.data.map(async (note) => {
                            try {
                                const stats = await getInteractionStats('sticky_note', note.id, fingerprint)
                                return {
                                    ...note,
                                    isLiked: stats.isLiked,
                                    likes: stats.likes,
                                    comments: stats.comments
                                }
                            } catch (error) {
                                console.error(`获取留言${note.id}的统计信息失败:`, error)
                                return note
                            }
                        })
                    )
                    return messagesWithLikeStatus
                }
                
                return response.data
            } catch (error) {
                console.error('加载留言失败:', error)
                return []
            }
        },
        [selectedCategory, fingerprint],
    )

    // 加载分类数据
    const loadCategories = useCallback(async () => {
        try {
            const data = await getStickyNoteCategories()
            const categoryNames = data.map(cat => cat.name)
            setCategories(categoryNames)
        } catch (error) {
            console.error('加载分类失败:', error)
        }
    }, [])

    useEffect(() => {
        loadCategories()
    }, [loadCategories])

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

    const handleAddMessage = async (newMessage: Omit<StickyNoteData, "id" | "date" | "likes" | "comments" | "createdAt" | "updatedAt">) => {
        try {
            const createdNote = await createStickyNote(newMessage)
            addItem(createdNote)
            setIsModalOpen(false)
            
            // 刷新分类列表，特别是如果是新分类
            if (newMessage.category && !categories.includes(newMessage.category)) {
                loadCategories()
            }
        } catch (error) {
            console.error('创建留言失败:', error)
            alert('创建留言失败，请重试')
        }
    }

    const handleLike = async (id: string) => {
        if (!fingerprint) return
        
        try {
            const userInfo = await collectUserInfo()
            const response = await toggleLike({
                targetType: 'sticky_note',
                targetId: id,
                fingerprint,
                userInfo
            })
            
            updateItem(
                (item) => item.id === id,
                (item) => ({
                    ...item,
                    likes: response.totalLikes,
                    isLiked: response.isLiked,
                })
            )
        } catch (error) {
            console.error('点赞失败:', error)
        }
    }

    const handleCommentAdded = (noteId: string, newCommentCount: number) => {
        updateItem(
            (item) => item.id === noteId,
            (item) => ({
                ...item,
                comments: newCommentCount,
            })
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

    // 创建适配器函数来匹配InfiniteScrollLoader的接口
    const handleLoadMore = async (): Promise<StickyNoteData[][]> => {
        await loadMore()
        return [] // InfiniteScrollLoader不使用返回值，items通过hook状态管理
    }

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
                        onLoadMore={handleLoadMore}
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
                        onCommentAdded={handleCommentAdded}
                    />
                </main>
            </div>
        </div>
    )
}
