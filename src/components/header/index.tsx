"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import SearchBox from "./search-box"
import ThemeToggle from "./theme-toggle"

export default function Header() {
    const [scrollY, setScrollY] = useState(0)
    const [previousScrollY, setPreviousScrollY] = useState(0)
    const [headerHeight, setHeaderHeight] = useState(64)
    const [isHeaderVisible, setIsHeaderVisible] = useState(true)

    const navigationItems = [
        { name: "首页", href: "/" },
        { name: "文章", href: "/articles" },
        { name: "随记", href: "/notes" },
        { name: "图库", href: "/gallery" },
        { name: "下载", href: "/download" },
        { name: "关于", href: "/about" },
        { name: "透明", href: "/transparent", hasNotification: true },
    ]

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const scrollThreshold = 100

            const isScrollingDown = currentScrollY > previousScrollY
            const isScrollingUp = currentScrollY < previousScrollY

            if (currentScrollY <= scrollThreshold) {
                setIsHeaderVisible(true)
            } else if (isScrollingDown && currentScrollY > scrollThreshold) {
                setIsHeaderVisible(false)
            } else if (isScrollingUp) {
                setIsHeaderVisible(true)
            }

            setPreviousScrollY(currentScrollY)
            setScrollY(currentScrollY)
        }

        const headerElement = document.querySelector("header")
        if (headerElement) {
            setHeaderHeight(headerElement.offsetHeight)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [previousScrollY])

    const scrollProgress = Math.min(scrollY / headerHeight, 1)
    const backgroundOpacity = scrollProgress * 0.8
    const blurIntensity = scrollProgress * 12

    return (
        <header
            className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
        ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}
      `}
            style={{
                backgroundColor: `rgba(249, 250, 251, ${backgroundOpacity})`,
                backdropFilter: `blur(${blurIntensity}px)`,
                WebkitBackdropFilter: `blur(${blurIntensity}px)`,
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">XA</div>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                            >
                                {item.name}
                                {item.hasNotification && (
                                    <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-red-500">
                                        <span className="sr-only">通知</span>
                                    </Badge>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* 现代化搜索框 */}
                        <SearchBox className="hidden lg:block" />

                        {/* Theme Toggle */}
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:text-white">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span className="sr-only">打开菜单</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className="md:hidden">
                <div
                    className="px-2 pt-2 pb-3 space-y-1 border-t transition-all duration-300 dark:border-gray-700"
                    style={{
                        backgroundColor: `rgba(249, 250, 251, ${Math.max(backgroundOpacity, 0.9)})`,
                        borderColor: `rgba(229, 231, 235, ${scrollProgress})`,
                    }}
                >
                    {/* 移动端搜索框 */}
                    <div className="px-3 py-2">
                        <SearchBox />
                    </div>

                    {/* 移动端主题切换 */}
                    <div className="px-3 py-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">主题切换</span>
                        <ThemeToggle />
                    </div>

                    {navigationItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="relative block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-md"
                        >
                            {item.name}
                            {item.hasNotification && (
                                <Badge className="absolute top-2 right-2 h-2 w-2 p-0 bg-red-500">
                                    <span className="sr-only">通知</span>
                                </Badge>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    )
}
