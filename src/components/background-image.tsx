"use client"

import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function BackgroundImage() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const isHomePage = pathname === "/"

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || !isHomePage) return null

    const isDark = theme === 'dark'

    return (
        <div className="absolute right-0 bottom-0 md:top-0 md:bottom-auto w-full flex justify-end z-0 pointer-events-none">
            <div className="w-[70%] md:w-auto">
                {isDark ? (
                    <Image 
                        src="https://huohuo90.com/images/dark.png" 
                        alt="Dark background" 
                        width={800} 
                        height={900} 
                        className="w-full h-auto md:h-screen md:w-auto object-contain object-right-bottom md:object-contain"
                        priority
                    />
                ) : (
                    <Image 
                        src="https://huohuo90.com/images/light.png" 
                        alt="Light background" 
                        width={800} 
                        height={900} 
                        className="w-full h-auto md:h-screen md:w-auto object-contain object-right-bottom md:object-contain"
                        priority
                    />
                )}
            </div>
        </div>
    )
} 