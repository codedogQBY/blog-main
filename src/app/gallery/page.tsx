import { Metadata } from 'next'
import { galleryAPI, getGalleryCategories } from "@/lib/gallery-api"
import type { GalleryItem } from "@/types/gallery"
import type { GalleryCategory } from "@/lib/gallery-api"
import GalleryClient from './gallery-client'

interface GalleryPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>
}

// 生成页面元数据
export async function generateMetadata({ searchParams }: GalleryPageProps): Promise<Metadata> {
  const params = await searchParams
  const { category } = params
  
  let title = '摄影图库 | 码上拾光'
  let description = '记录生活中的美好瞬间，分享摄影作品和创作心得'
  
  if (category && category !== '全部') {
    title = `${category} | 摄影图库 | 码上拾光`
    description = `浏览${category}分类下的摄影作品`
  }
  
  return {
    title,
    description,
    keywords: ['摄影', '图片', '艺术', '创作', category].filter((k): k is string => Boolean(k)),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: '/gallery',
    },
  }
}

// 服务端获取数据
async function getGalleryData(searchParams: { category?: string; page?: string }) {
  try {
    console.log('🚀 服务端获取图库数据...', searchParams)
    
    const { category, page = '1' } = searchParams
    const currentPage = parseInt(page) || 1
    const pageSize = 12
    
    // 并行获取图库和分类数据
    const [galleryResult, categoriesResult] = await Promise.allSettled([
      galleryAPI.getGalleryImages({
        page: currentPage,
        limit: pageSize,
        category: category && category !== '全部' ? category : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }),
      getGalleryCategories({
        includeStats: true,
        enabledOnly: true
      })
    ])

    // 处理图库数据
    const galleryData = galleryResult.status === 'fulfilled' ? galleryResult.value : { 
      items: [], 
      total: 0, 
      page: currentPage, 
      limit: pageSize, 
      hasMore: false 
    }
    const items: GalleryItem[] = galleryData.items || []
    
    // 处理分类数据
    const categories: GalleryCategory[] = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []

    console.log(`✅ 图库数据获取完成: 图片${items.length}张, 分类${categories.length}个`)

    return {
      initialItems: items,
      categories,
      pagination: {
        page: galleryData.page,
        limit: galleryData.limit,
        total: galleryData.total,
        hasMore: galleryData.hasMore
      },
      currentSearchParams: { category, page }
    }
  } catch (error) {
    console.error('❌ 图库数据获取失败:', error)
    
    // 返回默认数据
    return {
      initialItems: [],
      categories: [],
      pagination: null,
      currentSearchParams: { category: undefined, page: '1' }
    }
  }
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams
  const data = await getGalleryData(params)

  return (
    <GalleryClient 
      initialItems={data.initialItems}
      categories={data.categories}
      initialCategory={params.category || '全部'}
    />
  )
}
