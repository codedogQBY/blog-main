import { Metadata } from 'next'
import { getStickyNotes, getStickyNoteCategories } from '@/lib/sticky-note-api'
import type { StickyNoteData } from '@/lib/sticky-note-api'
import WallClient from './wall-client'

// 生成页面元数据
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '留言墙 | 码上拾光',
    description: '在这里留下你的足迹，分享你的想法，与大家一起交流互动',
    keywords: ['留言墙', '便签', '互动', '交流', '分享', '留言'],
    authors: [{ name: '码上拾光' }],
    openGraph: {
      title: '留言墙 | 码上拾光',
      description: '在这里留下你的足迹，分享你的想法，与大家一起交流互动',
      type: 'website',
      locale: 'zh_CN',
      url: '/wall',
      siteName: '码上拾光',
    },
    twitter: {
      card: 'summary',
      title: '留言墙 | 码上拾光',
      description: '在这里留下你的足迹，分享你的想法，与大家一起交流互动',
    },
    alternates: {
      canonical: '/wall',
    },
  }
}

// 服务端获取数据
async function getWallData() {
  try {
    console.log('🚀 服务端获取留言墙数据...')
    
    // 并行获取便签和分类数据
    const [notesResult, categoriesResult] = await Promise.allSettled([
      getStickyNotes({ 
        page: 1, 
        limit: 20 
      }),
      getStickyNoteCategories()
    ])

    // 处理便签数据
    const notesData = notesResult.status === 'fulfilled' ? notesResult.value : { data: [], pagination: null }
    const notes: StickyNoteData[] = notesData.data || []
    
    // 处理分类数据
    const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []

    console.log(`✅ 留言墙数据获取成功: ${notes.length}条便签, ${categories.length}个分类`)

    return {
      initialNotes: notes,
      categories,
      pagination: notesData.pagination
    }
  } catch (error) {
    console.error('❌ 留言墙数据获取失败:', error)
    
    // 返回默认数据
    return {
      initialNotes: [],
      categories: [],
      pagination: null
    }
  }
}

export default async function WallPage() {
  const data = await getWallData()

  return (
    <WallClient 
      initialNotes={data.initialNotes}
      categories={data.categories}
    />
  )
}
