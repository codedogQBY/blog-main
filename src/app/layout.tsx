import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import AnimatedBackground from "@/components/animated-background"
import { MonitoringInitializer } from '@/components/monitoring-initializer'
import { PerformanceMonitor } from '@/components/performance-monitor'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from 'sonner'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { getSiteConfig, DEFAULT_SITE_CONFIG } from '@/lib/site-config'
import { UserTracker } from '@/components/user-tracker'

async function generateMetadata(): Promise<Metadata> {
    try {
        const config = await getSiteConfig()
        return {
            title: config.title,
            description: config.description,
            icons: {
                icon: '/favicon.ico',
                apple: '/apple-touch-icon.png',
            },
            manifest: '/manifest.json',
            appleWebApp: {
                capable: true,
                statusBarStyle: 'default',
                title: config.title,
            },
            other: {
                'mobile-web-app-capable': 'yes',
                'apple-mobile-web-app-capable': 'yes',
                'apple-mobile-web-app-status-bar-style': 'default',
                'apple-mobile-web-app-title': config.title,
                'application-name': config.title,
                'msapplication-TileColor': '#000000',
                'msapplication-config': '/browserconfig.xml',
            },
        }
    } catch (error) {
        console.error('Failed to fetch site config:', error)
        return {
            title: DEFAULT_SITE_CONFIG.title,
            description: DEFAULT_SITE_CONFIG.description,
            icons: {
                icon: '/favicon.ico',
                apple: '/apple-touch-icon.png',
            },
            manifest: '/manifest.json',
            appleWebApp: {
                capable: true,
                statusBarStyle: 'default',
                title: DEFAULT_SITE_CONFIG.title,
            },
            other: {
                'mobile-web-app-capable': 'yes',
                'apple-mobile-web-app-capable': 'yes',
                'apple-mobile-web-app-status-bar-style': 'default',
                'apple-mobile-web-app-title': DEFAULT_SITE_CONFIG.title,
                'application-name': DEFAULT_SITE_CONFIG.title,
                'msapplication-TileColor': '#000000',
                'msapplication-config': '/browserconfig.xml',
            },
        }
    }
}

export const metadata = generateMetadata()

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
                        
                        // 源头预加载主要背景图片
                        const bgImage = new Image()
                        bgImage.src = theme === 'dark' ? '/dark.png' : '/light.png'
                        
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

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const config = await getSiteConfig().catch(() => DEFAULT_SITE_CONFIG)
    
    return (
        <html lang="zh-CN" suppressHydrationWarning className="theme-transition">
            <head>
                <ThemeScript />
                
                {/* 字体预加载 */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                
                {/* 关键资源预加载（最高优先级） */}
                <link rel="preload" href="/dark.png" as="image" type="image/png" />
                <link rel="preload" href="/light.png" as="image" type="image/png" />
                <link rel="preload" href="/logo.png" as="image" type="image/png" />
                
                {/* 关键CSS预加载 */}
                <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
                <link rel="preload" href="/_next/static/css/app/page.css" as="style" />
                
                {/* CDN 预连接（高优先级） */}
                <link rel="preconnect" href="https://beal-blog-main.test.upcdn.net" />
                <link rel="preconnect" href="https://code-shine.test.upcdn.net" />
                
                {/* DNS 预解析 */}
                <link rel="dns-prefetch" href="https://beal-blog-main.test.upcdn.net" />
                <link rel="dns-prefetch" href="https://code-shine.test.upcdn.net" />
                
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content={config.title} />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="application-name" content={config.title} />
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
                        <PerformanceMonitor />
                        <UserTracker />
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
