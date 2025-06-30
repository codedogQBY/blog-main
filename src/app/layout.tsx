import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/header/theme-provider"
import Header from "@/components/header";
import ScrollToTop from "@/components/scroll-to-top"

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
        <body className="font-sans">
        <ThemeProvider defaultTheme="system" storageKey="xa-theme">
            <Header />
            {children}
            <ScrollToTop />
        </ThemeProvider>
        </body>
        </html>
    )
}
