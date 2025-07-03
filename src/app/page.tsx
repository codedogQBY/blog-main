"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/header/theme-provider";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="min-h-screen flex flex-col justify-start pt-32 lg:justify-start lg:pt-24 relative">
        {/* 背景图片 */}
        <div className="absolute right-0 bottom-0 lg:top-0 lg:bottom-auto w-full flex justify-end z-0 pointer-events-none">
            <div className="w-[70%] lg:w-auto">
                {isDark ? (
                    <Image 
                        src="https://huohuo90.com/images/dark.png" 
                        alt="Dark background" 
                        width={800} 
                        height={900} 
                        className="w-full h-auto lg:h-screen lg:w-auto object-contain object-right-bottom lg:object-contain"
                        priority
                    />
                ) : (
                    <Image 
                        src="https://huohuo90.com/images/light.png" 
                        alt="Light background" 
                        width={800} 
                        height={900} 
                        className="w-full h-auto lg:h-screen lg:w-auto object-contain object-right-bottom lg:object-contain"
                        priority
                    />
                )}
            </div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-10 relative z-10">
            <div className="flex flex-col items-start w-full lg:w-3/5 lg:ml-[8%]">
                {/* 大标题 */}
                <h1 className="text-6xl sm:text-7xl lg:text-9xl font-bold mb-8 tracking-tighter whitespace-nowrap">
                    <span className="text-black dark:text-white">YIKE</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-300 dark:to-purple-300"> 时光</span>
                </h1>
                
                {/* 副标题 */}
                <div className="space-y-6 mb-12 text-left">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-100">慢下脚步</h2>
                    <p className="text-3xl lg:text-4xl font-medium text-gray-700 dark:text-gray-200">让心灵照亮前行的路</p>
                </div>
                
                {/* 按钮 */}
                <div className="mt-6">
                    <Link href="/blog">
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-7 text-xl rounded-full">
                            开始阅读
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
        
        {/* 滚动指示器 */}
        <div className="absolute bottom-10 left-8 lg:left-1/2 lg:-translate-x-1/2">
            <div className="w-14 h-28 rounded-full bg-blue-400 dark:bg-blue-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white animate-arrow-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </div>
    </div>
  );
}
