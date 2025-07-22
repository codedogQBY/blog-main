"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback } from "react";
import ArticleCard from "@/components/blog/article-card";
import type { Article } from "@/types/article";
import DiaryCarousel from "@/components/diary/diary-carousel";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Heart, MessageCircle } from "lucide-react";
import type { GalleryItem } from "@/lib/gallery-api";
import type { StickyNoteData } from '@/lib/sticky-note-api';
import { useRouter } from "next/navigation";
import type { SiteConfig } from '@/lib/site-config';

interface HomeClientProps {
  initialArticles: Article[];
  initialGalleries: GalleryItem[];
  initialStickyNotes: StickyNoteData[];
  siteConfig?: SiteConfig;
}

export default function HomeClient({ 
  initialArticles, 
  initialGalleries, 
  initialStickyNotes, 
  siteConfig 
}: HomeClientProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<GalleryItem['images']>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const secondScreenRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<{ handlePrevious: () => void; handleNext: () => void }>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const scrollToSecondScreen = useCallback(() => {
    secondScreenRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  const handleArticleClick = useCallback((article: Article) => {
    if (article.slug) {
      window.location.href = `/blog/${article.slug}`;
    }
  }, []);

  const handlePrevGallery = useCallback(() => {
    setCurrentGalleryIndex((prev) => (prev > 0 ? prev - 1 : initialGalleries.length - 1));
  }, [initialGalleries.length]);

  const handleNextGallery = useCallback(() => {
    setCurrentGalleryIndex((prev) => (prev < initialGalleries.length - 1 ? prev + 1 : 0));
  }, [initialGalleries.length]);

  const openLightbox = useCallback((imageUrl: string, galleryImages: GalleryItem['images'], index: number) => {
    setSelectedImage(imageUrl);
    setSelectedGalleryImages(galleryImages);
    setSelectedImageIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const nextImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev + 1) % selectedGalleryImages.length);
    setSelectedImage(selectedGalleryImages[(selectedImageIndex + 1) % selectedGalleryImages.length].imageUrl);
  }, [selectedGalleryImages, selectedImageIndex]);

  const prevImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : selectedGalleryImages.length - 1));
    setSelectedImage(selectedGalleryImages[selectedImageIndex > 0 ? selectedImageIndex - 1 : selectedGalleryImages.length - 1].imageUrl);
  }, [selectedGalleryImages, selectedImageIndex]);

  // 使用 useMemo 优化计算属性（用于调试）
  // const currentGallery = useMemo(() => 
  //   initialGalleries[currentGalleryIndex] || null, 
  //   [initialGalleries, currentGalleryIndex]
  // );

  // 使用计算属性（用于调试）
  // const currentGalleryImages = useMemo(() => 
  //   currentGallery?.images || [], 
  //   [currentGallery]
  // );

  const handleStickyNoteClick = useCallback((noteId: string) => {
    router.push(`/wall?noteId=${noteId}`);
  }, [router]);

  if (!mounted) return null;
  
  const isDark = theme === 'dark';
  
  return (
    <>
      {/* 第一屏：主页欢迎部分 */}
      <div className="min-h-screen flex flex-col justify-start pt-32 lg:justify-start lg:pt-24 relative">
          <div className="absolute right-0 bottom-0 lg:top-0 lg:bottom-auto w-full flex justify-end z-0 pointer-events-none">
              <div className="w-[70%] lg:w-auto">
                  {isDark ? (
                      <Image 
                          src="/dark.png" 
                          alt="Dark background" 
                          width={800} 
                          height={900} 
                          className="w-full h-auto lg:h-screen lg:w-auto object-contain object-right-bottom lg:object-contain"
                          style={{ width: 'auto', height: 'auto' }}
                          priority
                      />
                  ) : (
                      <Image 
                          src="/light.png" 
                          alt="Light background" 
                          width={800} 
                          height={900} 
                          className="w-full h-auto lg:h-screen lg:w-auto object-contain object-right-bottom lg:object-contain"
                          style={{ width: 'auto', height: 'auto' }}
                          priority
                      />
                  )}
              </div>
          </div>
          
          <div className="container mx-auto px-4 lg:px-10 relative z-10">
              <div className="flex flex-col items-start w-full lg:w-3/5 lg:ml-[8%]">
                  <h1 className="text-6xl sm:text-7xl lg:text-9xl font-bold mb-8 tracking-tighter whitespace-nowrap">
                      <span className="text-black dark:text-white">
                          {siteConfig?.heroTitle?.first || 'CODE'}
                      </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-300 dark:to-purple-300">
                          {' '}{siteConfig?.heroTitle?.second || 'SHINE'}
                      </span>
                  </h1>
                  
                  <div className="space-y-6 mb-12 text-left">
                      <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-100">
                          {siteConfig?.title || '码上拾光'}
                      </h2>
                      <p className="text-3xl lg:text-4xl font-medium text-gray-700 dark:text-gray-200">
                          {siteConfig?.subtitle || '在代码间打捞落日余辉'}
                      </p>
                  </div>
                  
                  <div className="mt-6">
                      <Link href="/blog" className="cursor-pointer">
                          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-7 text-xl rounded-full cursor-pointer">
                              开始阅读
                          </Button>
                      </Link>
                  </div>
              </div>
          </div>
          
          <div className="absolute bottom-8 left-8 lg:left-1/2 lg:transform lg:-translate-x-1/2 cursor-pointer animate-bounce" onClick={scrollToSecondScreen}>
              <div className="w-8 h-12 border-2 border-gray-700 dark:border-gray-300 rounded-full flex items-start justify-center">
                  <div className="w-2 h-3 bg-gray-700 dark:bg-gray-300 rounded-full mt-2 animate-scroll"></div>
              </div>
          </div>
      </div>
      
      {/* 第二屏：博客文章部分 */}
      <div ref={secondScreenRef} className="py-20">
          <div className="container mx-auto px-4 lg:px-10">
              <div className="mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">博客文章</h2>
                  <p className="text-gray-600 dark:text-gray-400">记录生活，分享思考，探索世界</p>
              </div>
              
              <div className="max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {initialArticles.map((article) => (
                          <ArticleCard 
                              key={article.id} 
                              article={article} 
                              onClick={handleArticleClick}
                          />
                      ))}
                  </div>
              </div>
              
              <div className="flex justify-center mt-12">
                  <Link href="/blog">
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-lg rounded-full hover:scale-105 transition-transform">
                          更多
                      </Button>
                  </Link>
              </div>
          </div>
      </div>
      
      {/* 第三屏：随笔随记部分 */}
      <div className="py-20">
        <div className="container mx-auto px-4 lg:px-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">随写随记</h2>
              <p className="text-gray-600 dark:text-gray-400">平淡的日子里留下浅浅的痕迹</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => carouselRef.current?.handlePrevious()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => carouselRef.current?.handleNext()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="w-full mx-auto lg:w-[60%] h-[calc(100vh-8rem)] lg:h-[calc(110vh-8rem)] min-h-[600px]">
            <DiaryCarousel ref={carouselRef} />
          </div>
          
          <div className="flex justify-center mt-6">
              <Link href="/diary">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-lg rounded-full hover:scale-105 transition-transform">
                      更多
                  </Button>
              </Link>
          </div>
        </div>
      </div>

      {/* 第四屏：图库部分 */}
      <div className="py-20">
        <div className="container mx-auto px-4 lg:px-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">摄影图集</h2>
              <p className="text-gray-600 dark:text-gray-400">记录美好瞬间，分享生活点滴</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 cursor-pointer hover:scale-105 transition-transform"
                onClick={handlePrevGallery}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 cursor-pointer hover:scale-105 transition-transform"
                onClick={handleNextGallery}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="w-full mx-auto lg:w-full">
            {initialGalleries.map((gallery, index) => (
              <div
                  key={gallery.id}
                  className={`relative w-full h-[450px] lg:h-[700px] rounded-3xl overflow-hidden transition-opacity duration-300 group cursor-pointer ${
                    index === currentGalleryIndex ? 'block' : 'hidden'
                  }`}
                  onClick={() => window.location.href = `/gallery/${gallery.id}`}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${gallery.coverImage || '/placeholder.jpg'})` }}
                  />
                
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20 lg:bg-gradient-to-r lg:from-black/20 lg:via-black/40 lg:to-black/70" />
                
                <div className="relative z-10 h-full flex flex-col p-8 lg:p-12">
                  <div className="absolute top-8 left-8 lg:top-12 lg:right-12 lg:left-auto max-w-md">
                    <h3 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                      {gallery.title}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-white/90 mb-6">
                      <time className="text-base font-medium drop-shadow">
                        {new Date(gallery.createdAt).toLocaleDateString('zh-CN')}
                      </time>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <MessageCircle size={16} />
                          <span className="font-medium text-sm">{gallery.stats?.comments || 0}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Heart size={16} />
                          <span className="font-medium text-sm">{gallery.stats?.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/95 text-sm leading-relaxed drop-shadow max-w-xs line-clamp-4 lg:line-clamp-8">
                      {gallery.description}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-8 left-4 lg:bottom-12 lg:left-12 z-20">
                    <div className="w-[85vw] lg:w-[calc(192px*3+24px*4)] overflow-x-auto mb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:hover:bg-white/50 [&::-webkit-scrollbar-track]:bg-white/10">
                      <div className="flex gap-3 lg:gap-6 pb-2">
                        {gallery.images.filter(image => image.imageUrl !== gallery.coverImage).map((image, imageIndex) => (
                          <button
                            key={image.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openLightbox(image.imageUrl, gallery.images, imageIndex);
                            }}
                            className="relative flex-shrink-0 w-[120px] h-20 lg:w-48 lg:h-32 p-0.5 cursor-pointer"
                          >
                            <div className="relative w-full h-full rounded-lg overflow-hidden hover:ring-2 hover:ring-white/80 transition-all duration-300">
                              <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition-colors duration-300" />
                              <Image
                                src={image.imageUrl}
                                alt={image.title || gallery.title}
                                width={192}
                                height={128}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/gallery">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-lg rounded-full hover:scale-105 transition-transform">
                更多
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 第五屏：留言墙部分 */}
      <div className="py-20">
        <div className="container mx-auto px-4 lg:px-10">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">留言墙</h2>
            <p className="text-gray-600 dark:text-gray-400">很多事情值得记录，当然也值得回忆</p>
          </div>

          <div className="w-full mx-auto lg:w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {initialStickyNotes.map((note, index) => {
                const colorMap = {
                  pink: {
                    normal: "bg-[#FF6B8A]",
                    hover: "hover:bg-[#E65F7C]"
                  },
                  yellow: {
                    normal: "bg-[#FFA53F]",
                    hover: "hover:bg-[#E69438]"
                  },
                  blue: {
                    normal: "bg-[#5EBBFF]",
                    hover: "hover:bg-[#54A8E6]"
                  },
                  green: {
                    normal: "bg-[#3FD6A7]",
                    hover: "hover:bg-[#38BF95]"
                  },
                  purple: {
                    normal: "bg-[#8A70FF]",
                    hover: "hover:bg-[#7B64E6]"
                  }
                };

                return (
                  <div
                    key={note.id}
                    onClick={() => handleStickyNoteClick(note.id)}
                    className={`relative ${colorMap[note.color].normal} ${colorMap[note.color].hover} rounded-lg p-4 cursor-pointer transition-colors h-[252px] w-[300px] mx-auto sm:w-full ${index >= 4 ? 'hidden sm:block' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white/80 text-xs">
                        {note.date}
                      </div>
                      <div className="text-white/90 text-xs px-2 py-1 bg-white/10 rounded-full">
                        {note.category}
                      </div>
                    </div>

                    <div className="flex-1 h-[164px]">
                      <p className="text-white text-sm leading-relaxed font-medium break-words line-clamp-6 overflow-hidden">
                        {note.content}
                      </p>
                    </div>

                    <div className="h-[30px] flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-white/80">
                        <div className="flex items-center space-x-1">
                          <Heart className={`w-3.5 h-3.5 ${note.isLiked ? "fill-white text-white" : ""}`} />
                          <span className="text-xs">{note.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-xs">{note.comments}</span>
                        </div>
                      </div>

                      <div className="text-white text-xs">
                        {note.author}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/wall">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-lg rounded-full hover:scale-105 transition-transform">
                更多
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 图片查看器 */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/20 cursor-pointer hover:scale-105"
            >
              <X size={24} className="text-white" />
            </button>
            
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/20 cursor-pointer hover:scale-105"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/20 cursor-pointer hover:scale-105"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          
            <div className="flex items-center justify-center w-full h-full">
              <Image
                src={selectedImage}
                alt="Gallery image"
                width={1920}
                height={1080}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white font-medium border border-white/20">
              {selectedImageIndex + 1} / {selectedGalleryImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 