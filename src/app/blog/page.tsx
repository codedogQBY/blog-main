"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import BlogListClient from './blog-list-client'

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    articles: number;
  };
}

interface ArticleForDisplay {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  slug: string;
  published: boolean;
  views: number;
  readTime?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  tags?: string[];
  author?: string;
  publishDate?: string;
  comments?: number;
}

export default function ArticlesPage() {
  const [data, setData] = useState<{
    initialArticles: ArticleForDisplay[];
    categories: Category[];
    categoryStats: Record<string, number>;
    displayCategories: string[];
  }>({
    initialArticles: [],
    categories: [],
    categoryStats: { "全部": 0 },
    displayCategories: ["全部"]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getBlogData() {
      try {
        // 并行获取分类和文章数据
        const [categoriesResponse, articlesResponse] = await Promise.all([
          api.getCategories({ 
            limit: 100, 
            status: 'enabled',
            withPublishedArticles: true 
          }),
          api.getArticles({ page: 1, limit: 9, published: true })
        ]);

        // 计算分类统计 - 只显示有文章的分类
        const stats: Record<string, number> = {}
        const categoryNames = ["全部"]
        
        // 过滤出有文章的分类（后端已经过滤了，这里作为双重保险）
        const categoriesWithArticles = categoriesResponse.data.filter(category => 
          (category._count?.articles || 0) > 0
        )
        
        // 先计算各个分类的文章数量
        categoriesWithArticles.forEach((category) => {
          const articleCount = category._count?.articles || 0
          stats[category.name] = articleCount
          categoryNames.push(category.name)
        })
        
        // "全部"的数量应该是所有已发布文章的总数，而不是分类数量的简单相加
        // 这里使用文章API返回的总数
        stats["全部"] = articlesResponse.pagination.total

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

        setData({
          initialArticles: formattedArticles,
          categories: categoriesWithArticles,
          categoryStats: stats,
          displayCategories: categoryNames
        });
      } catch (error) {
        console.error('获取博客数据失败:', error);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }

    getBlogData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <BlogListClient 
      initialArticles={data.initialArticles}
      categories={data.categories}
      categoryStats={data.categoryStats}
      displayCategories={data.displayCategories}
    />
  );
}
