"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import SearchBox from "./search-box"
import ThemeToggle from "./theme-toggle"
import { useTheme } from "next-themes"
import Image from "next/image"

export default function Header() {
    const [scrollY, setScrollY] = useState(0)
    const [previousScrollY, setPreviousScrollY] = useState(0)
    const [isHeaderVisible, setIsHeaderVisible] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { theme } = useTheme()
    const pathname = usePathname()

    const navigationItems = [
        { name: "首页", href: "/" },
        { name: "文章", href: "/blog" },
        { name: "随记", href: "/diary" },
        { name: "图库", href: "/gallery" },
        { name: "留言", href: "/wall" },
        { name: "关于", href: "/about" },
    ]

    // 判断是否为当前页面
    const isCurrentPage = (href: string) => {
        if (href === "/") {
            return pathname === "/"
        }
        return pathname.startsWith(href)
    }

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const scrollThreshold = 50

            if (currentScrollY <= scrollThreshold) {
                setIsHeaderVisible(true)
            } else if (currentScrollY > previousScrollY && currentScrollY > scrollThreshold) {
                setIsHeaderVisible(false)
            } else if (currentScrollY < previousScrollY) {
                setIsHeaderVisible(true)
            }

            setPreviousScrollY(currentScrollY)
            setScrollY(currentScrollY)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [previousScrollY])

    // 如果还没有挂载，返回一个基础的 header 结构
    if (!mounted) {
        return (
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out translate-y-0">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        </Link>
                    </div>
                </div>
            </header>
        )
    }

    // 计算背景透明度
    const scrollProgress = Math.min(scrollY / 100, 1)
    const backgroundOpacity = scrollProgress * 0.9
    const blurIntensity = scrollProgress * 20

    return (
        <>
            <header
                className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
          ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}
        `}
                style={{
                    backgroundColor: theme === "dark"
                        ? `rgba(15, 23, 42, ${backgroundOpacity})`
                        : `rgba(255, 255, 255, ${backgroundOpacity})`,
                    backdropFilter: `blur(${blurIntensity}px)`,
                    WebkitBackdropFilter: `blur(${blurIntensity}px)`,
                    borderBottom: scrollY > 10
                        ? `1px solid ${theme === "dark" ? "rgba(148, 163, 184, 0.1)" : "rgba(0, 0, 0, 0.05)"}`
                        : "1px solid transparent",
                }}
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navigationItems.map((item) => {
                                const isActive = isCurrentPage(item.href)
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                      relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg group cursor-pointer
                      ${
                                            isActive
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                        }
                    `}
                                    >
                                        {/* 背景高亮 */}
                                        <div
                                            className={`
                      absolute inset-0 rounded-lg transition-all duration-200
                      ${
                                                isActive
                                                    ? "bg-blue-50 dark:bg-blue-950/50 scale-100"
                                                    : "bg-gray-100 dark:bg-gray-800 scale-0 group-hover:scale-100"
                                            }
                    `}
                                        />

                                        {/* 文字 */}
                                        <span className="relative z-10">{item.name}</span>

                                        {/* 底部指示器 */}
                                        {isActive && (
                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-4">
                            <SearchBox className="hidden lg:block" onSelect={() => setIsMobileMenuOpen(false)} />
                            <ThemeToggle />

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden p-2 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                  <span
                      className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                          isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                      }`}
                  />
                                    <span
                                        className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                                            isMobileMenuOpen ? "opacity-0" : ""
                                        }`}
                                    />
                                    <span
                                        className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                                            isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                                        }`}
                                    />
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
                </div>
            )}

            {/* Mobile Menu */}
            <div
                className={`
        fixed top-16 left-4 right-4 z-50 md:hidden transition-all duration-300 ease-out
        ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
      `}
            >
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <SearchBox onSelect={() => setIsMobileMenuOpen(false)} />
                    </div>

                    {/* Navigation */}
                    <div className="p-2">
                        {navigationItems.map((item) => {
                            const isActive = isCurrentPage(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${
                                        isActive
                                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }
                  `}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className="font-medium">{item.name}</span>
                                    <div className="flex items-center space-x-2">
                                        {isActive && <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Theme Toggle */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">主题切换</span>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </>
    )
}
