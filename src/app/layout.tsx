import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/header/theme-provider"
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"] })

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
        <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider defaultTheme="system" storageKey="xa-theme">
            <Header/>
            {children}
        </ThemeProvider>
        </body>
        </html>
    )
}
