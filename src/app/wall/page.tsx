"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import StickyNote, { type StickyNoteData } from "@/components/wall/sticky-note"
import AddMessageModal from "@/components/wall/add-message-modal"
import MessageDetailModal from "@/components/wall/message-detail-modal"

// 模拟数据
const initialMessages: StickyNoteData[] = [
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
    {
        id: "11",
        content: "想去新疆西藏旅游，妹妹说没有钱的味",
        author: "匿名",
        date: "05/28 14:37",
        category: "目标",
        color: "purple",
        likes: 0,
        comments: 0,
    },
    {
        id: "12",
        content: "呢呢呢呢我是欣欣大人了",
        author: "无题",
        date: "05/28 14:19",
        category: "无题",
        color: "blue",
        likes: 0,
        comments: 0,
    },
    {
        id: "13",
        content: "我家门前有两棵树\n一棵是枣树",
        author: "匿名",
        date: "05/27 14:51",
        category: "留言",
        color: "pink",
        likes: 0,
        comments: 0,
    },
    {
        id: "14",
        content: "记录",
        author: "匿名",
        date: "05/25 17:59",
        category: "留言",
        color: "yellow",
        likes: 0,
        comments: 0,
    },
    {
        id: "15",
        content: "从昨晚过来的，学习用vue写留言。",
        author: "匿名",
        date: "05/24 12:20",
        category: "留言",
        color: "green",
        likes: 0,
        comments: 0,
    },
]

const categories = ["全部", "留言", "目标", "理想", "过去", "将来", "爱情", "亲情", "友情", "秘密", "信条", "无题"]

export default function MessagesPage() {
    const [messages, setMessages] = useState<StickyNoteData[]>(initialMessages)
    const [selectedCategory, setSelectedCategory] = useState("全部")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState<StickyNoteData | null>(null)
    const [columns, setColumns] = useState<StickyNoteData[][]>([[], [], [], []])

    // 筛选消息
    const filteredMessages = useMemo(() => {
        if (selectedCategory === "全部") {
            return messages
        }
        return messages.filter((message) => message.category === selectedCategory)
    }, [messages, selectedCategory])

    // 瀑布流布局
    useEffect(() => {
        const newColumns: StickyNoteData[][] = [[], [], [], []]

        filteredMessages.forEach((message, index) => {
            const columnIndex = index % 4
            newColumns[columnIndex].push(message)
        })

        setColumns(newColumns)
    }, [filteredMessages])

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

        setMessages((prev) => [message, ...prev])
    }

    const handleLike = (id: string) => {
        setMessages((prev) =>
            prev.map((message) => (message.id === id ? { ...message, likes: message.likes + 1 } : message)),
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
                                {categories.map((category, index) => (
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
                                <p className="text-xs text-gray-500 dark:text-gray-400">{filteredMessages.length} 条留言</p>
                            </div>
                        </div>
                    </div>

                    {/* 瀑布流布局 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {columns.map((column, columnIndex) => (
                            <div key={columnIndex} className="space-y-6">
                                {column.map((message) => (
                                    <StickyNote
                                        key={message.id}
                                        note={message}
                                        onLike={handleLike}
                                        onComment={handleComment}
                                        onClick={handleNoteClick}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* 添加留言按钮 */}
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                    >
                        <Plus className="h-6 w-6" />
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
