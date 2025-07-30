import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { MonitoringInitializer } from '@/components/monitoring-initializer'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from 'sonner'
import { getSiteConfig, DEFAULT_SITE_CONFIG } from '@/lib/site-config'
import { DelayedComponents } from '@/components/lazy-components'
import { ProgressWrapper } from '@/components/progress-wrapper'

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

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <html lang="zh-CN" suppressHydrationWarning className="theme-transition">
            <head>
                {/* 关键资源预加载（仅预加载最重要的资源） */}
                <link rel="preload" href="/logo.png" as="image" type="image/png" />

                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </head>
            <body className="font-sans bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen theme-transition theme-mask flex flex-col" suppressHydrationWarning>
                <ErrorBoundary>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="xa-theme" disableTransitionOnChange>
                        <ProgressWrapper>
                            <Header />
                            <main className="relative flex-1">
                                {children}
                            </main>
                            <Footer />
                            <MonitoringInitializer />
                            <Toaster
                                position="top-right"
                                richColors
                                closeButton
                                duration={2000}
                            />
                            <DelayedComponents />
                        </ProgressWrapper>
                    </ThemeProvider>
                </ErrorBoundary>
            </body>
        </html>
    )
}
