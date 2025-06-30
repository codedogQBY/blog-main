"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, List } from "lucide-react"
import type { Note } from "@/types/note"
import { diaryApi, type DiaryNote } from "@/lib/diary-api"
import NoteListItem from "@/components/diary/note-list-item"
import NotePaper from "@/components/diary/note-paper"

export default function NotesPage() {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [displayedNotes, setDisplayedNotes] = useState<Note[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [showMobileList, setShowMobileList] = useState(true) // 移动端显示状态
    const [hasMore, setHasMore] = useState(true)
    const pageSize = 8

    // 将API响应转换为Note格式
    const convertToNote = (diaryNote: DiaryNote): Note => ({
        id: diaryNote.id,
        title: diaryNote.title,
        content: diaryNote.content,
        excerpt: diaryNote.excerpt,
        images: diaryNote.images,
        weather: diaryNote.weather,
        mood: diaryNote.mood,
        status: diaryNote.status,
        date: diaryNote.date,
        time: diaryNote.time,
        createdAt: diaryNote.createdAt,
        updatedAt: diaryNote.updatedAt,
    })

    // 初始化加载第一页数据
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsInitialLoading(true)
                const response = await diaryApi.getNotes({
                    page: 1,
                    limit: pageSize,
                })
                
                const notes = response.data.map(convertToNote)
                setDisplayedNotes(notes)
                setHasMore(response.pagination.hasMore)
                
                if (notes.length > 0) {
                    setSelectedNote(notes[0])
                }
            } catch (error) {
                console.error('加载随记失败:', error)
            } finally {
                setIsInitialLoading(false)
            }
        }

        loadInitialData()
    }, [])

    // 手动加载更多
    const handleLoadMore = async () => {
        if (isLoading || !hasMore) return

        setIsLoading(true)

        try {
            const nextPage = currentPage + 1
            const response = await diaryApi.getNotes({
                page: nextPage,
                limit: pageSize,
            })

            const newNotes = response.data.map(convertToNote)
            setDisplayedNotes(prev => [...prev, ...newNotes])
            setCurrentPage(nextPage)
            setHasMore(response.pagination.hasMore)
        } catch (error) {
            console.error('加载更多随记失败:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // 选择随记
    const handleNoteSelect = (note: Note) => {
        setSelectedNote(note)
        // 在移动端选择随记后切换到详情视图
        setShowMobileList(false)
    }

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">加载随记中...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
            <div className="pt-16">
                <div className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-4rem)]">
                    {/* 移动端顶部导航 */}
                    <div className="lg:hidden mb-4">
                        {!showMobileList && selectedNote ? (
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMobileList(true)}
                                    className="flex items-center space-x-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>返回列表</span>
                                </Button>
                                <div className="flex-1 text-center">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{selectedNote.title}</h2>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <List className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">随记</h2>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{displayedNotes.length} 篇</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
                        {/* 左侧随记列表 */}
                        <div
                            className={`
                lg:col-span-2 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl 
                border border-white/20 dark:border-gray-700/20 shadow-sm overflow-hidden flex flex-col
                ${showMobileList ? "block" : "hidden lg:flex"}
              `}
                        >
                            <div className="p-6 border-b border-gray-100/50 dark:border-gray-800/50 hidden lg:block">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">随记</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {displayedNotes.length} 篇随记
                                </p>
                            </div>

                            {/* 随记列表 - 隐藏滚动条 */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                                {displayedNotes.length > 0 ? (
                                    displayedNotes.map((note) => (
                                        <NoteListItem
                                            key={note.id}
                                            note={note}
                                            isSelected={selectedNote?.id === note.id}
                                            onClick={handleNoteSelect}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <div className="text-2xl">📝</div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">还没有随记</h3>
                                        <p className="text-gray-500 dark:text-gray-400">开始记录生活的点点滴滴吧！</p>
                                    </div>
                                )}
                            </div>

                            {/* 加载更多按钮 */}
                            <div className="p-4 border-t border-gray-100/50 dark:border-gray-800/50">
                                <Button
                                    onClick={handleLoadMore}
                                    disabled={isLoading || !hasMore}
                                    className="w-full h-12 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
                                    variant="outline"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                            <span>加载中...</span>
                                        </div>
                                    ) : hasMore ? (
                                        "加载更多"
                                    ) : (
                                        "已加载全部"
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* 右侧信纸详情 */}
                        <div
                            className={`
                lg:col-span-3
                ${!showMobileList ? "block" : "hidden lg:block"}
              `}
                        >
                            <NotePaper note={selectedNote} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
