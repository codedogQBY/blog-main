import { Metadata } from "next"
import { api } from "@/lib/api"
import BlogListClient from './blog-list-client'


async function getBlogData() {
  try {
    // 并行获取分类和文章数据
    const [categoriesResponse, articlesResponse] = await Promise.all([
      api.getCategories({ 
        limit: 100, 
        status: 'enabled',
        withPublishedArticles: true 
      }),
      api.getArticles({ page: 1, limit: 9 })
    ]);

    // 计算分类统计 - 只显示有文章的分类
    const stats: Record<string, number> = { "全部": 0 }
    const categoryNames = ["全部"]
    
    // 过滤出有文章的分类（后端已经过滤了，这里作为双重保险）
    const categoriesWithArticles = categoriesResponse.data.filter(category => 
      (category._count?.articles || 0) > 0
    )
    
    categoriesWithArticles.forEach((category) => {
      const articleCount = category._count?.articles || 0
      stats[category.name] = articleCount
      stats["全部"] += articleCount
      categoryNames.push(category.name)
    })

    // 转换API数据格式以兼容现有组件
    const formattedArticles = articlesResponse.data.map(article => ({
      ...article,
      publishDate: article.publishedAt || article.createdAt,
      category: typeof article.category === 'object' ? article.category.name : article.category,
      tags: Array.isArray(article.tags) 
        ? article.tags.map(t => typeof t === 'string' ? t : t.tag.name)
        : [],
      comments: article._count?.comments || 0,
      author: typeof article.author === 'object' ? article.author.name : article.author,
      coverImage: article.coverImage || "/placeholder.svg?height=128&width=128",
    }));

    return {
      initialArticles: formattedArticles,
      categories: categoriesWithArticles, // 只返回有文章的分类
      categoryStats: stats,
      displayCategories: categoryNames
    };
  } catch (error) {
    console.error('获取博客数据失败:', error);
    return {
      initialArticles: [],
      categories: [],
      categoryStats: { "全部": 0 },
      displayCategories: ["全部"]
    };
  }
}

export const metadata: Metadata = {
  title: '文章列表 | 码上拾光',
  description: '记录生活，分享思考，探索世界',
  openGraph: {
    title: '文章列表 | 码上拾光',
    description: '记录生活，分享思考，探索世界',
    type: 'website',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default async function ArticlesPage() {
  const { initialArticles, categories, categoryStats, displayCategories } = await getBlogData();

  return (
    <BlogListClient 
      initialArticles={initialArticles}
      categories={categories}
      categoryStats={categoryStats}
      displayCategories={displayCategories}
    />
  );
}
