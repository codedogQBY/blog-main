import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/header/theme-provider"
import Header from "@/components/header";
import ScrollToTop from "@/components/scroll-to-top"
import AnimatedBackground from "@/components/animated-background"

export const metadata: Metadata = {
    title: "XA - 现代化网站",
    description: "使用 Next.js、Tailwind CSS 和 shadcn/ui 构建的现代化网站",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN" suppressHydrationWarning>
        <body className="font-sans bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen" suppressHydrationWarning>
        <ThemeProvider defaultTheme="system" storageKey="xa-theme">
            <AnimatedBackground />
            <Header />
            <main className="relative">
                {children}
            </main>
            <ScrollToTop />
        </ThemeProvider>
        </body>
        </html>
    )
}
