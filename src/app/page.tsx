import { Metadata } from 'next'
import { api } from "@/lib/api"
import { getGalleryImages } from "@/lib/gallery-api"
import { getStickyNotes } from '@/lib/sticky-note-api'
import { getSiteConfig } from '@/lib/site-config'
import HomeClient from '@/app/home-client'
import type { Article } from '@/types/article'
import type { GalleryItem } from '@/types/gallery'
import type { StickyNoteData } from '@/lib/sticky-note-api'
import type { SiteConfig } from '@/lib/site-config'

// 生成页面元数据
export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteConfig = await getSiteConfig()
    
    return {
      title: siteConfig?.seoDefaults?.title || '码上拾光',
      description: siteConfig?.seoDefaults?.description || '在代码间打捞落日余辉',
      keywords: siteConfig?.seoDefaults?.keywords || ['技术博客', '编程', '前端', '后端', '摄影', '生活'],
      authors: [{ name: siteConfig?.title || '码上拾光' }],
      openGraph: {
        title: siteConfig?.seoDefaults?.title || '码上拾光',
        description: siteConfig?.seoDefaults?.description || '在代码间打捞落日余辉',
        type: 'website',
        locale: 'zh_CN',
        url: '/',
        siteName: siteConfig?.title || '码上拾光',
      },
      twitter: {
        card: 'summary_large_image',
        title: siteConfig?.seoDefaults?.title || '码上拾光',
        description: siteConfig?.seoDefaults?.description || '在代码间打捞落日余辉',
      },
      alternates: {
        canonical: '/',
      },
    }
  } catch (error) {
    console.error('生成首页元数据失败:', error)
    return {
      title: '码上拾光',
      description: '在代码间打捞落日余辉',
    }
  }
}

// 服务端获取数据
async function getHomeData() {
  try {
    console.log('🚀 服务端获取首页数据...')
    
    // 并行获取所有数据
    const [articlesResult, galleriesResult, stickyNotesResult, siteConfigResult] = await Promise.allSettled([
      api.getArticles({ page: 1, limit: 4, published: true }),
      getGalleryImages({ page: 1, limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
      getStickyNotes({ page: 1, limit: 8 }),
      getSiteConfig()
    ])

    // 处理结果，即使部分失败也要返回可用数据
    const articles: Article[] = articlesResult.status === 'fulfilled' ? articlesResult.value.data : []
    const galleries: GalleryItem[] = galleriesResult.status === 'fulfilled' ? galleriesResult.value.items : []
    const stickyNotes: StickyNoteData[] = stickyNotesResult.status === 'fulfilled' ? stickyNotesResult.value.data : []
    const siteConfig: SiteConfig | null = siteConfigResult.status === 'fulfilled' ? siteConfigResult.value : null

    console.log(`✅ 首页数据获取完成: 文章${articles.length}篇, 图库${galleries.length}张, 便签${stickyNotes.length}条`)

    return {
      articles,
      galleries,
      stickyNotes,
      siteConfig
    }
  } catch (error) {
    console.error('❌ 首页数据获取失败:', error)
    
    // 返回默认数据，确保页面能正常渲染
    return {
      articles: [],
      galleries: [],
      stickyNotes: [],
      siteConfig: null
    }
  }
}

export default async function HomePage() {
  const data = await getHomeData()

  return (
    <HomeClient 
      initialArticles={data.articles}
      initialGalleries={data.galleries}
      initialStickyNotes={data.stickyNotes}
      siteConfig={data.siteConfig || undefined}
    />
  )
}
