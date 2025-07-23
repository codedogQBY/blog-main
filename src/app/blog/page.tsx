import { Metadata } from 'next'
import { api } from "@/lib/api"
import BlogListClient from './blog-list-client'
import type { Article } from '@/lib/api'

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    articles: number;
  };
}

interface CategoryStats {
  [key: string]: number;
}

interface BlogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>
}

// 生成页面元数据
export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams
  const { search, category } = params
  
  let title = '文章 | 码上拾光'
  let description = '记录生活，分享思考，探索世界'
  
  if (search) {
    title = `搜索"${search}" | 文章 | 码上拾光`
    description = `在博客中搜索"${search}"的相关文章`
  }
  
  if (category && category !== '全部') {
    title = `${category} | 文章 | 码上拾光`
    description = `浏览${category}分类下的文章`
  }
  
  return {
    title,
    description,
    keywords: ['技术博客', '编程', '前端', '后端', search, category].filter((k): k is string => Boolean(k)),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'zh_CN',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: '/blog',
    },
  }
}

// 服务端获取数据
async function getBlogData(searchParams: { search?: string; category?: string; page?: string }) {
  try {
    console.log('🚀 服务端获取博客列表数据...', searchParams)
    
    const { search, category, page = '1' } = searchParams
    const currentPage = parseInt(page) || 1
    const limit = 9
    
    // 并行获取文章和分类数据
    const [articlesResult, categoriesResult] = await Promise.allSettled([
      api.getArticles({
        page: currentPage,
        limit,
        search: search || undefined,
        category: category && category !== '全部' ? category : undefined,
        published: true
      }),
      api.getCategories({ 
        withPublishedArticles: true,
        limit: 100 // 获取所有分类
      })
    ])

    // 处理文章数据
    const articlesData: Article[] = articlesResult.status === 'fulfilled' ? articlesResult.value.data : []
    
    // 转换为BlogListClient期望的格式
    const articles = articlesData.map(article => ({
      ...article,
      category: typeof article.category === 'object' ? article.category.name : article.category,
      tags: Array.isArray(article.tags) 
        ? article.tags.map(t => typeof t === 'string' ? t : t.tag.name)
        : [],
      author: typeof article.author === 'object' ? article.author.name : article.author,
      publishDate: article.publishedAt || article.createdAt,
      comments: article._count?.comments || 0,
    }))
    
    const pagination = articlesResult.status === 'fulfilled' ? articlesResult.value.pagination : {
      page: currentPage,
      limit,
      total: 0,
      totalPages: 0
    }

    // 处理分类数据
    const categories: Category[] = categoriesResult.status === 'fulfilled' ? categoriesResult.value.data : []
    
    // 计算分类统计
    const categoryStats: CategoryStats = {}
    categories.forEach(cat => {
      if (cat._count?.articles) {
        categoryStats[cat.name] = cat._count.articles
      }
    })

    // 添加"全部"选项的文章总数
    const totalArticles = Object.values(categoryStats).reduce((sum, count) => sum + count, 0)
    categoryStats['全部'] = totalArticles

    // 为显示创建分类列表（包含"全部"选项）
    const displayCategories = [
      '全部',
      ...categories.map(cat => cat.name)
    ]

    console.log(`✅ 博客数据获取完成: 文章${articles.length}篇, 分类${categories.length}个`)

    return {
      initialArticles: articles,
      categories,
      categoryStats,
      displayCategories,
      pagination,
      currentSearchParams: { search, category, page }
    }
  } catch (error) {
    console.error('❌ 博客数据获取失败:', error)
    
    // 返回默认数据
    return {
      initialArticles: [],
      categories: [],
      categoryStats: { '全部': 0 },
      displayCategories: ['全部'],
      pagination: {
        page: 1,
        limit: 9,
        total: 0,
        totalPages: 0
      },
      currentSearchParams: { search: undefined, category: undefined, page: '1' }
    }
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const data = await getBlogData(params)

  return (
    <BlogListClient 
      initialArticles={data.initialArticles}
      categories={data.categories}
      categoryStats={data.categoryStats}
      displayCategories={data.displayCategories}
    />
  )
}
