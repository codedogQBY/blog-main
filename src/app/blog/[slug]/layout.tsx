import type { Metadata } from 'next';
import { api } from '@/lib/api';

interface ArticleLayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata(props: ArticleLayoutProps): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const article = await api.getArticleBySlug(slug);
    const title = article.metaTitle || article.title;
    const description = article.metaDescription || article.excerpt;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/blog/${slug}`,
        type: 'article',
        images: article.coverImage ? [article.coverImage] : [],
      },
    };
  } catch {
    return {
      title: '文章不存在',
      description: '未找到该文章',
    };
  }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 