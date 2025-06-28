"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    actualTheme: "light" | "dark"
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    actualTheme: "light",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
                                  children,
                                  defaultTheme = "system",
                                  storageKey = "vite-ui-theme",
                                  ...props
                              }: ThemeProviderProps) {
    // 只在客户端初始化主题
    const [theme, setTheme] = useState<Theme>(defaultTheme)
    const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")
    const [mounted, setMounted] = useState(false)

    // 客户端挂载后获取保存的主题
    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem(storageKey) as Theme
        if (savedTheme) {
            setTheme(savedTheme)
        }
    }, [storageKey])

    useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement
        root.classList.remove("light", "dark")

        let resolvedTheme: "light" | "dark" = "light"

        if (theme === "system") {
            resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        } else {
            resolvedTheme = theme
        }

        root.classList.add(resolvedTheme)
        setActualTheme(resolvedTheme)
    }, [theme, mounted])

    const value = {
        theme,
        actualTheme,
        setTheme: (newTheme: Theme) => {
            localStorage.setItem(storageKey, newTheme)
            setTheme(newTheme)
        },
    }

    // 服务端渲染时不渲染主题相关内容
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
