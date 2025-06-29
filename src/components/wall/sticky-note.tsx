"use client"

import React, { useState, useRef } from "react"
import { Heart, MessageCircle, Calendar, Tag } from "lucide-react"

export interface StickyNoteData {
    id: string
    content: string
    author: string
    date: string
    category: string
    color: "pink" | "yellow" | "blue" | "green" | "purple"
    likes: number
    comments: number
    isLiked?: boolean
}

interface StickyNoteProps {
    note: StickyNoteData
    onLike?: (id: string) => void
    onComment?: (id: string) => void
    onClick?: (note: StickyNoteData) => void
}

const modernColorThemes = {
    pink: {
        gradient: "from-rose-400/20 via-pink-300/15 to-rose-500/20",
        border: "border-rose-200/30",
        glow: "shadow-rose-500/20",
        accent: "bg-gradient-to-r from-rose-400 to-pink-500",
        text: "text-rose-600",
        hover: "hover:shadow-rose-500/30",
        // 暗色主题下保持颜色
        darkGradient: "dark:from-rose-400/30 dark:via-pink-300/20 dark:to-rose-500/30",
        darkBorder: "dark:border-rose-300/40",
    },
    yellow: {
        gradient: "from-amber-400/20 via-yellow-300/15 to-orange-400/20",
        border: "border-amber-200/30",
        glow: "shadow-amber-500/20",
        accent: "bg-gradient-to-r from-amber-400 to-orange-500",
        text: "text-amber-600",
        hover: "hover:shadow-amber-500/30",
        darkGradient: "dark:from-amber-400/30 dark:via-yellow-300/20 dark:to-orange-400/30",
        darkBorder: "dark:border-amber-300/40",
    },
    blue: {
        gradient: "from-blue-400/20 via-cyan-300/15 to-blue-500/20",
        border: "border-blue-200/30",
        glow: "shadow-blue-500/20",
        accent: "bg-gradient-to-r from-blue-400 to-cyan-500",
        text: "text-blue-600",
        hover: "hover:shadow-blue-500/30",
        darkGradient: "dark:from-blue-400/30 dark:via-cyan-300/20 dark:to-blue-500/30",
        darkBorder: "dark:border-blue-300/40",
    },
    green: {
        gradient: "from-emerald-400/20 via-green-300/15 to-teal-400/20",
        border: "border-emerald-200/30",
        glow: "shadow-emerald-500/20",
        accent: "bg-gradient-to-r from-emerald-400 to-teal-500",
        text: "text-emerald-600",
        hover: "hover:shadow-teal-500/30",
        darkGradient: "dark:from-emerald-400/30 dark:via-green-300/20 dark:to-teal-400/30",
        darkBorder: "dark:border-emerald-300/40",
    },
    purple: {
        gradient: "from-violet-400/20 via-purple-300/15 to-indigo-400/20",
        border: "border-violet-200/30",
        glow: "shadow-violet-500/20",
        accent: "bg-gradient-to-r from-violet-400 to-indigo-500",
        text: "text-violet-600",
        hover: "hover:shadow-violet-500/30",
        darkGradient: "dark:from-violet-400/30 dark:via-purple-300/20 dark:to-indigo-400/30",
        darkBorder: "dark:border-violet-300/40",
    },
}

export default function StickyNote({ note, onLike, onComment, onClick }: StickyNoteProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const theme = modernColorThemes[note.color]

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation()
        onLike?.(note.id)
    }

    const handleComment = (e: React.MouseEvent) => {
        e.stopPropagation()
        onComment?.(note.id)
    }

    const handleClick = () => {
        onClick?.(note)
    }

    return (
        <article
            ref={cardRef}
            className={`
        group relative overflow-hidden rounded-3xl border backdrop-blur-xl cursor-pointer
        transition-all duration-500 ease-out transform-gpu
        bg-gradient-to-br ${theme.gradient} ${theme.darkGradient}
        ${theme.border} ${theme.darkBorder} ${theme.glow}
        ${isHovered ? `scale-[1.02] shadow-2xl ${theme.hover} backdrop-blur-xl` : "shadow-lg hover:shadow-xl"}
        ${isPressed ? "scale-95" : ""}
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onClick={handleClick}
            style={{
                transform: isHovered ? "perspective(1000px) rotateX(2deg) rotateY(-2deg)" : "none",
            }}
        >
            {/* Top accent bar */}
            <div className={`h-6 w-full ${theme.accent} opacity-80`} />

            <div className="relative p-8 space-y-6">
                {/* Header */}
                <header className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                        <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        <time className="text-xs font-medium text-gray-600 dark:text-gray-300">{note.date}</time>
                    </div>
                </header>

                {/* Content */}
                <div className="space-y-3">
                    <p className="text-gray-800 dark:text-gray-100 text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">
                        {note.content}
                    </p>
                </div>

                {/* Category tag */}
                <div className="flex justify-start">
          <span
              className={`
              inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold
              bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-600/20
              ${theme.text} dark:text-gray-300
              transform transition-all duration-300 group-hover:scale-105
            `}
          >
            <Tag className="w-3 h-3" />
            <span>{note.category}</span>
          </span>
                </div>

                {/* Footer */}
                <footer className="flex items-center justify-between pt-2">
                    {/* Interaction buttons */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={handleLike}
                            className={`
                group/like flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all duration-300
                hover:scale-110 active:scale-95 transform-gpu
                ${
                                note.isLiked
                                    ? "bg-red-500/20 text-red-500 shadow-red-500/20 shadow-lg"
                                    : "hover:bg-white/30 dark:hover:bg-gray-700/30 text-gray-500 dark:text-gray-400 hover:text-red-500"
                            }
              `}
                        >
                            <Heart
                                className={`
                  w-4 h-4 transition-all duration-300 group-hover/like:scale-125
                  ${note.isLiked ? "fill-current animate-pulse" : "group-hover/like:fill-current"}
                `}
                            />
                            <span className="text-sm font-medium">{note.likes}</span>
                        </button>
                        <button
                            onClick={handleComment}
                            className="group/comment flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 transform-gpu hover:bg-white/30 dark:hover:bg-gray-700/30 text-gray-500 dark:text-gray-400 hover:text-blue-500"
                        >
                            <MessageCircle
                                className="w-4 h-4 transition-all duration-300 group-hover/comment:scale-125 group-hover/comment:fill-current"
                            />
                            <span className="text-sm font-medium">{note.comments}</span>
                        </button>
                    </div>
                </footer>
            </div>
        </article>
    )
}