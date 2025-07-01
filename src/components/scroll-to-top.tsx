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

    // 在文章详情页、图库详情页和留言页不显示，因为这些页面有自己的浮动按钮组件
    const shouldHide = (pathname?.startsWith('/blog/') && pathname !== '/blog') || 
                      (pathname?.startsWith('/gallery/') && pathname !== '/gallery') ||
                      pathname === '/wall'
    
    if (!showButton || shouldHide) return null

    return (
        <Button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            size="icon"
            aria-label="返回顶部"
        >
            <ArrowUp className="w-5 h-5" />
        </Button>
    )
}
