import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import Header from "@/components/header";
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import AnimatedBackground from "@/components/animated-background"

export const metadata: Metadata = {
    title: "CODE SHINE - 码上拾光 在代码间里打捞落日余辉",
    description: "一个记录个人成长和思考的博客",
    icons: {
        icon: '/favicon.ico',
    },
}

function ThemeScript() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    (function() {
                        function getTheme() {
                            const storageTheme = localStorage.getItem('xa-theme')
                            if (storageTheme) return storageTheme
                            
                            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                return 'dark'
                            }
                            return 'light'
                        }
                        
                        const theme = getTheme()
                        const root = document.documentElement
                        root.classList.add(theme)
                        
                        // 添加 no-transition 类以防止初始加载时的过渡效果
                        root.classList.add('no-transition')
                        
                        // 在页面加载完成后移除 no-transition 类
                        window.addEventListener('load', () => {
                            setTimeout(() => {
                                root.classList.remove('no-transition')
                                document.body.classList.add('theme-ready')
                            }, 0)
                        })
                    })()
                `,
            }}
        />
    )
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN" suppressHydrationWarning className="theme-transition">
            <head>
                <ThemeScript />
            </head>
            <body className="font-sans bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen theme-transition theme-mask flex flex-col" suppressHydrationWarning>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="xa-theme">
                    <AnimatedBackground />
                    <Header />
                    <main className="relative flex-1">
                        {children}
                    </main>
                    <Footer />
                    <ScrollToTop />
                </ThemeProvider>
            </body>
        </html>
    )
}
