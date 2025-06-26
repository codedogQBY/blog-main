"use client"

import { Sun, Cloud, CloudRain, CloudSnow, CloudSun } from "lucide-react"
import type { WeatherType } from "@/types/note"

interface WeatherIconProps {
    weather: WeatherType
    className?: string
}

const weatherConfig = {
    sunny: {
        icon: Sun,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    cloudy: {
        icon: Cloud,
        color: "text-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-800/50",
    },
    rainy: {
        icon: CloudRain,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    snowy: {
        icon: CloudSnow,
        color: "text-cyan-500",
        bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    },
    "partly-cloudy": {
        icon: CloudSun,
        color: "text-orange-500",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
}

export default function WeatherIcon({ weather, className = "" }: WeatherIconProps) {
    const config = weatherConfig[weather]
    const IconComponent = config.icon

    return (
        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} ${className}`}>
            <IconComponent className={`w-4 h-4 ${config.color}`} />
        </div>
    )
}
