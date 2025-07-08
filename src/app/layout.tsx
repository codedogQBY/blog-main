import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import Header from "@/components/header";
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import AnimatedBackground from "@/components/animated-background"
import { MonitoringInitializer } from '@/components/monitoring-initializer';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from 'sonner';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

export const metadata: Metadata = {
    title: "码上拾光 - 在代码间打捞落日余辉",
    description: "一个记录个人成长和思考的博客",
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: '个人博客',
    },
    other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'apple-mobile-web-app-title': '个人博客',
        'application-name': '个人博客',
        'msapplication-TileColor': '#000000',
        'msapplication-config': '/browserconfig.xml',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#000000',
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
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="个人博客" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="application-name" content="个人博客" />
            </head>
            <body className="font-sans bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen theme-transition theme-mask flex flex-col" suppressHydrationWarning>
                <ErrorBoundary>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="xa-theme" disableTransitionOnChange>
                        <AnimatedBackground />
                        <Header />
                        <main className="relative flex-1">
                            {children}
                        </main>
                        <Footer />
                        <ScrollToTop />
                        <MonitoringInitializer />
                        <Toaster 
                            position="top-right"
                            richColors
                            closeButton
                            duration={2000}
                        />
                        <PWAInstallPrompt />
                    </ThemeProvider>
                </ErrorBoundary>
            </body>
        </html>
    )
}
