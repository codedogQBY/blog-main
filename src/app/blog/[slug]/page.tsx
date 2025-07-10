import { notFound } from "next/navigation"
import { Metadata } from "next"
import { api } from "@/lib/api"
import type { Article } from "@/lib/api"
import ArticleDetailClient from "./article-detail-client"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const article = await api.getArticleBySlug(slug)
                
                // 增加浏览量
    if (article.id) {
      await api.incrementArticleViews(article.id)
    }
    
    return article
  } catch (error) {
    console.error('获取文章失败:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const article = await getArticle(resolvedParams.slug)
  
  if (!article) {
    return {
      title: '文章未找到',
      description: '该文章不存在或已被删除'
    }
  }

  const authorName = typeof article.author === 'object' ? article.author.name : article.author

  return {
    title: `${article.title} | 码上拾光`,
    description: article.excerpt || article.title,
    keywords: article.tags ? 
      Array.isArray(article.tags) 
        ? article.tags.map(t => typeof t === 'string' ? t : t.tag.name).join(',')
        : []
      : [],
    authors: [{ name: authorName || '未知作者' }],
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [authorName || '未知作者'],
      tags: article.tags ? 
        Array.isArray(article.tags) 
          ? article.tags.map(t => typeof t === 'string' ? t : t.tag.name)
          : []
        : [],
      images: article.coverImage ? [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.title,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
    alternates: {
      canonical: `/blog/${resolvedParams.slug}`,
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const article = await getArticle(resolvedParams.slug)

  if (!article) {
    notFound()
  }

  return <ArticleDetailClient article={article} />
} 