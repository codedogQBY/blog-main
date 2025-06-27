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
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage?.getItem(storageKey) as Theme) || defaultTheme
        }
        return defaultTheme
    })
    const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")

    useEffect(() => {
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
    }, [theme])

    const value = {
        theme,
        actualTheme,
        setTheme: (theme: Theme) => {
            localStorage?.setItem(storageKey, theme)
            setTheme(theme)
        },
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
