"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, List } from "lucide-react"
import type { Note } from "@/types/note"
import { diaryApi, type DiaryNote } from "@/lib/diary-api"
import NoteListItem from "@/components/diary/note-list-item"
import NotePaper from "@/components/diary/note-paper"

interface DiaryClientProps {
  initialNotes: Note[]
  initialPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export default function DiaryClient({ initialNotes, initialPagination }: DiaryClientProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [displayedNotes, setDisplayedNotes] = useState<Note[]>(initialNotes)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(initialPagination.page)
  const [showMobileList, setShowMobileList] = useState(true) // 移动端显示状态
  const [hasMore, setHasMore] = useState(initialPagination.hasMore)
  const pageSize = initialPagination.limit

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

  // 初始化选中第一个笔记
  useEffect(() => {
    if (initialNotes.length > 0 && !selectedNote) {
      setSelectedNote(initialNotes[0])
    }
  }, [initialNotes, selectedNote])

  // 监听hash变化
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        const targetNote = displayedNotes.find(note => note.id === hash)
        if (targetNote) {
          setSelectedNote(targetNote)
          setShowMobileList(false)
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [displayedNotes])

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

  return (
    <div className="min-h-screen">
      <div className="pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-8 h-[calc(100vh-4rem)]">
          {/* 移动端顶部导航 */}
          <div className="lg:hidden mb-4">
            {!showMobileList && selectedNote ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileList(true)}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">随记</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">({displayedNotes.length})</span>
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
                lg:col-span-3 h-[calc(100vh-8rem)]
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