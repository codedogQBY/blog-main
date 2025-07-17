"use client"

import Image from "next/image"
import type { AboutConfig } from "@/types/about"

interface AboutClientProps {
  aboutData: AboutConfig | null
}

export default function AboutClient({ aboutData }: AboutClientProps) {
  if (!aboutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">加载失败，请刷新重试</p>
        </div>
      </div>
    )
  }

  // 合并所有标签用于移动端显示
  const allTags = [...aboutData.hero.leftTags, ...aboutData.hero.rightTags]

  return (
    <div className="min-h-screen">
      {/* 英雄区域 - 标签展示 */}
      <section 
        className="relative min-h-screen flex items-center justify-center pt-20 pb-10 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url(${aboutData.hero.avatar || "/placeholder.svg"})`,
        }}
      >
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
        
        <div className="w-full px-4 lg:px-8 relative z-10">
          {/* 桌面端布局 */}
          <div className="hidden lg:flex lg:justify-between lg:items-center lg:h-full">
            {/* 左侧标签 */}
            <div className="flex flex-col space-y-4 items-end pl-28">
              {aboutData.hero.leftTags.map((tag, index) => {
                const totalTags = aboutData.hero.leftTags.length;
                const normalizedPosition = index / (totalTags - 1);
                const curve = (1 - Math.sin(normalizedPosition * Math.PI)) * 120;
                return (
                  <div
                    key={`left-${index}`}
                    className="inline-block px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-300 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                      transform: `translateX(${curve}px)`,
                    }}
                  >
                    {tag}
                  </div>
                );
              })}
            </div>

            {/* 中间签名 */}
            <div className="flex justify-center items-center">
              <div className="text-white font-handwriting text-3xl drop-shadow-lg">
                {aboutData.hero.signature}
              </div>
            </div>

            {/* 右侧标签 */}
            <div className="flex flex-col space-y-4 items-start pr-28">
              {aboutData.hero.rightTags.map((tag, index) => {
                const totalTags = aboutData.hero.rightTags.length;
                const normalizedPosition = index / (totalTags - 1);
                const curve = (1 - Math.sin(normalizedPosition * Math.PI)) * 120;
                return (
                  <div
                    key={`right-${index}`}
                    className="inline-block px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-300 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{
                      animationDelay: `${(index + aboutData.hero.leftTags.length) * 0.1}s`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                      transform: `translateX(-${curve}px)`,
                    }}
                  >
                    {tag}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 移动端布局 */}
          <div className="lg:hidden flex flex-col items-center space-y-8 relative z-10">
            {/* 签名 */}
            <div className="text-white font-handwriting text-2xl text-center drop-shadow-lg">
              {aboutData.hero.signature}
            </div>

            {/* 标签云 - 移动端优化布局 */}
            <div className="w-full max-w-md">
              <div className="flex flex-wrap justify-center gap-3">
                {allTags.map((tag, index) => (
                  <div
                    key={`mobile-${index}`}
                    className="inline-block px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-300 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 关于介绍 */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{aboutData.intro.title}</h2>
              <div className="prose prose-lg text-gray-600 dark:text-gray-300 leading-relaxed space-y-6">
                {aboutData.intro.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center">
              {aboutData.intro.logo ? (
                <div className="relative group">
                  <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 transition-all duration-300 group-hover:scale-105">
                    <div className="w-48 h-48 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                      <Image
                        src={aboutData.intro.logo}
                        alt="Logo"
                        width={192}
                        height={192}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                      码上拾光
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    </div>
                    <div className="text-center text-xs text-gray-700 dark:text-gray-300 font-medium">
                      码上拾光
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 动态渲染各个章节 */}
      {aboutData.sections.map((section, sectionIndex) => (
        <section
          key={section.id}
          className={`py-12 lg:py-20 ${sectionIndex % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"}`}
        >
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-8 lg:mb-12">
              {section.title}
            </h2>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {/* 左侧文字内容 */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {section.content.map((paragraph, index) => (
                    <p key={index} className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* 右侧图片 */}
              <div className="space-y-6">
                {section.images && section.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {section.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 transition-all duration-300 group-hover:scale-105">
                          <Image
                            src={image.src || "/placeholder.svg"}
                            alt={image.alt}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                            onError={(e) => {
                              console.error('Section image failed to load:', image.src);
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="text-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {image.caption}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .font-handwriting {
          font-family: 'Brush Script MT', cursive;
        }
      `}</style>
    </div>
  )
} 