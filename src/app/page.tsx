"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/header/theme-provider";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import ArticleCard from "@/components/blog/article-card";
import type { Article } from "@/types/article";
import DiaryCarousel from "@/components/diary/diary-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Note } from "@/types/note";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const secondScreenRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<{ handlePrevious: () => void; handleNext: () => void }>(null);
  
  const scrollToSecondScreen = () => {
    secondScreenRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // 获取最新文章
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.getArticles({ page: 1, limit: 4 });
        // 转换API数据格式以兼容现有组件
        const formattedArticles = response.data.map(article => ({
          ...article,
          publishDate: article.publishedAt || article.createdAt,
          category: typeof article.category === 'object' ? article.category.name : article.category,
          tags: Array.isArray(article.tags) 
            ? article.tags.map(t => typeof t === 'string' ? t : t.tag.name)
            : [],
          comments: article._count?.comments || 0,
          author: typeof article.author === 'object' ? article.author.name : article.author,
          coverImage: article.coverImage || "/placeholder.svg?height=128&width=128",
        }));
        setArticles(formattedArticles);
      } catch (error) {
        console.error('获取文章失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);
  
  const handleArticleClick = (article: Article) => {
    if (article.slug) {
      window.location.href = `/blog/${article.slug}`;
    }
  };
  
  return (
    <>
      {/* 第一屏：主页欢迎部分 */}
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
          <div 
              className="absolute bottom-10 left-8 lg:left-1/2 lg:-translate-x-1/2 cursor-pointer"
              onClick={scrollToSecondScreen}
          >
              <div className="w-14 h-28 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white animate-arrow-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
              </div>
          </div>
      </div>
      
      {/* 第二屏：博客文章部分 */}
      <div ref={secondScreenRef} className="py-20">
          <div className="container mx-auto px-4 lg:px-10">
              {/* 标题部分 */}
              <div className="mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">博客文章</h2>
                  <p className="text-gray-600 dark:text-gray-400">记录生活，分享思考，探索世界</p>
              </div>
              
              {/* 文章卡片列表 */}
              {loading ? (
                  <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
              ) : (
                  <div className="max-w-5xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {articles.map((article) => (
                              <ArticleCard 
                                  key={article.id} 
                                  article={article} 
                                  onClick={handleArticleClick}
                              />
                          ))}
                      </div>
                  </div>
              )}
              
              {/* 更多按钮 */}
              <div className="flex justify-center mt-12">
                  <Link href="/blog">
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-lg rounded-full">
                          更多
                      </Button>
                  </Link>
              </div>
          </div>
      </div>
      
      {/* 第三屏：随笔随记部分 */}
      <div className="py-20">
        <div className="container mx-auto px-4 lg:px-10">
          {/* 标题部分 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">随写随记</h2>
              <p className="text-gray-600 dark:text-gray-400">平淡的日子里留下浅浅的痕迹</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90"
                onClick={() => carouselRef.current?.handlePrevious()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90"
                onClick={() => carouselRef.current?.handleNext()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 随记轮播 */}
          <div className="w-full mx-auto lg:w-[70.83%] h-[calc(100vh-12rem)] lg:h-[calc(125vh-15rem)] min-h-[500px]">
            <DiaryCarousel ref={carouselRef} />
          </div>
          
          {/* 更多按钮 */}
          <div className="flex justify-center mt-6">
            <Link href="/diary">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-lg rounded-full">
                更多
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
