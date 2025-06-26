"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ScrollToTop() {
    const [showButton, setShowButton] = useState(false)
    const pathname = usePathname()

    // 监听滚动显示返回顶部按钮
    useEffect(() => {
        const handleScroll = () => {
            setShowButton(window.scrollY > 300)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    if (!showButton) return null

    // 根据页面路径调整按钮位置，避免与留言墙的添加按钮重叠
    const isWallPage = pathname === "/wall"
    const positionClass = isWallPage ? "bottom-8 right-24" : "bottom-8 right-8"

    return (
        <Button
            onClick={scrollToTop}
            className={`fixed ${positionClass} z-50 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110`}
            size="icon"
            aria-label="返回顶部"
        >
            <ArrowUp className="w-5 h-5" />
        </Button>
    )
}
