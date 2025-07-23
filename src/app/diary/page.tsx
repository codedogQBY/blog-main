import { Metadata } from 'next'
import { diaryApi, type DiaryNote } from "@/lib/diary-api"
import type { Note } from "@/types/note"
import DiaryClient from './diary-client'

// 生成页面元数据
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '日记本 | 码上拾光',
    description: '记录生活的点点滴滴，分享日常的思考与感悟',
    keywords: ['日记', '生活记录', '个人博客', '心情随笔', '生活感悟'],
    authors: [{ name: '码上拾光' }],
    openGraph: {
      title: '日记本 | 码上拾光',
      description: '记录生活的点点滴滴，分享日常的思考与感悟',
      type: 'website',
      locale: 'zh_CN',
      url: '/diary',
      siteName: '码上拾光',
    },
    twitter: {
      card: 'summary',
      title: '日记本 | 码上拾光',
      description: '记录生活的点点滴滴，分享日常的思考与感悟',
    },
    alternates: {
      canonical: '/diary',
    },
  }
}

// 服务端获取数据
async function getDiaryData() {
  try {
    console.log('🚀 服务端获取日记列表数据...')
    
    // 获取第一页日记数据
    const response = await diaryApi.getNotes({
      page: 1,
      limit: 8, // 初始加载8条
    })
    
    // 转换为Note格式
    const notes: Note[] = response.data.map((diaryNote: DiaryNote) => ({
      id: diaryNote.id,
      title: diaryNote.title,
      content: diaryNote.content,
      excerpt: diaryNote.excerpt,
      images: diaryNote.images,
      weather: diaryNote.weather,
      mood: diaryNote.mood,
      status: diaryNote.status,
      date: diaryNote.date,
      time: diaryNote.time,
      createdAt: diaryNote.createdAt,
      updatedAt: diaryNote.updatedAt,
    }))

    console.log(`✅ 日记数据获取成功: ${notes.length}条`)

    return {
      initialNotes: notes,
      pagination: {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        hasMore: response.pagination.hasMore
      }
    }
  } catch (error) {
    console.error('❌ 日记数据获取失败:', error)
    
    // 返回默认数据
    return {
      initialNotes: [],
      pagination: {
        page: 1,
        limit: 8,
        total: 0,
        totalPages: 0,
        hasMore: false
      }
    }
  }
}

export default async function DiaryPage() {
  const data = await getDiaryData()

  return (
    <DiaryClient 
      initialNotes={data.initialNotes}
      initialPagination={data.pagination}
    />
  )
}
