"use client"

import type { Note } from "@/types/note"
import WeatherIcon from "./weather-icon"

interface NoteListItemProps {
    note: Note
    isSelected?: boolean
    onClick: (note: Note) => void
}

export default function NoteListItem({ note, isSelected, onClick }: NoteListItemProps) {
    // 获取心情表情
    const getMoodEmoji = (mood?: number) => {
        if (mood === undefined || mood === null) return ''
        const moodMap: Record<number, string> = {
            0: '😞',
            1: '😕', 
            2: '😐',
            3: '🙂',
            4: '😊',
            5: '😄'
        }
        return moodMap[mood] || ''
    }

    return (
        <div
            className={`
        p-4 rounded-xl cursor-pointer transition-all duration-200 border hover:scale-[1.02] hover:shadow-md
        ${
                isSelected
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }
      `}
            onClick={() => onClick(note)}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono transition-colors duration-200 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                    {note.date} {note.time}
                </div>
                <div className="flex items-center space-x-2">
                    {/* 心情显示 */}
                    {note.mood !== undefined && note.mood !== null && (
                        <span className="text-sm transition-transform duration-200 hover:scale-125">{getMoodEmoji(note.mood)}</span>
                    )}
                    <WeatherIcon weather={note.weather} />
                </div>
            </div>

            <h3
                className={`
        font-medium mb-2 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400
        ${isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-white"}
      `}
            >
                {note.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed transition-colors duration-200 group-hover:text-gray-900 dark:group-hover:text-gray-200">{note.excerpt}</p>
        </div>
    )
}
