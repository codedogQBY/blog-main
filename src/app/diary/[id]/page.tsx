"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { diaryApi, type DiaryNote } from "@/lib/diary-api"
import NotePaper from "@/components/diary/note-paper"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Note } from "@/types/note"

export default function DiaryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [note, setNote] = useState<Note | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

    useEffect(() => {
        const loadNote = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const response = await diaryApi.getNote(params.id)
                setNote(convertToNote(response))
            } catch (error) {
                console.error('获取随记失败:', error)
                setError('获取随记失败，该随记可能不存在或已被删除')
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            loadNote()
        }
    }, [params.id])

    const handleBack = () => {
        router.push('/diary')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">加载随记中...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="max-w-lg w-full mx-auto px-6">
                    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-sm p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="text-2xl">😢</div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {error}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            你可以返回随记列表查看其他内容
                        </p>
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="flex items-center space-x-2 mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>返回列表</span>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="pt-20">
                <div className="max-w-4xl mx-auto px-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="mb-6 flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>返回列表</span>
                    </Button>
                    {note && (
                        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-sm overflow-hidden h-[calc(100vh-12rem)]">
                            <NotePaper note={note} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 