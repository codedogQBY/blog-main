"use client"

import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import NotePaper from "./note-paper"
import { diaryApi } from "@/lib/diary-api"
import type { Note } from "@/types/note"

const DiaryCarousel = forwardRef<{ handlePrevious: () => void; handleNext: () => void }, {}>(function DiaryCarousel(_, ref) {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await diaryApi.getNotes({ page: 1, limit: 4 })
        setNotes(response.data || [])
      } catch (error) {
        console.error('加载随记失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : notes.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < notes.length - 1 ? prev + 1 : 0))
  }

  // 暴露翻页方法
  useImperativeHandle(ref, () => ({
    handlePrevious,
    handleNext
  }))

  return (
    <div id="diary-carousel" className="h-full">
      <NotePaper note={notes[currentIndex] || null} />
    </div>
  )
})

export default DiaryCarousel 