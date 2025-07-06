import { Metadata } from 'next'
import { api } from '@/lib/api'

interface ArticleLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export async function generateMetadata({ params }: ArticleLayoutProps): Promise<Metadata> {
  try {
    const article = await api.getArticleBySlug(params.slug)
    
    const title = article.metaTitle || article.title
    const description = article.metaDescription || article.excerpt
    const keywords = article.metaKeywords
    const canonicalUrl = article.canonicalUrl || `https://yourdomain.com/blog/${article.slug}`
    
    return {
      title,
      description,
      keywords: keywords ? keywords.split(',').map((k: string) => k.trim()) : undefined,
      openGraph: {
        title,
        description,
        type: 'article',
        url: canonicalUrl,
        images: article.coverImage ? [article.coverImage] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: article.coverImage ? [article.coverImage] : undefined,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    }
  } catch (error) {
    return {
      title: '文章不存在',
      description: '请求的文章不存在或已被删除',
    }
  }
}

export default function ArticleLayout({ children }: ArticleLayoutProps) {
  return children
} 