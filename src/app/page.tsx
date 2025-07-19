'use client';

import { useEffect, useState } from 'react';
import { api } from "@/lib/api";
import { getGalleryImages } from "@/lib/gallery-api";
import { getStickyNotes } from '@/lib/sticky-note-api';
import { getSiteConfig } from '@/lib/site-config';
import HomeClient from '@/app/home-client';
import type { Article } from '@/types/article';
import type { GalleryItem } from '@/types/gallery';
import type { StickyNoteData } from '@/lib/sticky-note-api';
import type { SiteConfig } from '@/lib/site-config';

export default function Home() {
  const [data, setData] = useState<{
    articles: Article[];
    galleries: GalleryItem[];
    stickyNotes: StickyNoteData[];
    siteConfig: SiteConfig | null;
  }>({
    articles: [],
    galleries: [],
    stickyNotes: [],
    siteConfig: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 并行获取所有数据
        const [articlesResponse, galleriesResponse, stickyNotesResponse, siteConfig] = await Promise.all([
          api.getArticles({ page: 1, limit: 4 }),
          getGalleryImages({
            page: 1,
            limit: 4,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }),
          getStickyNotes({
            page: 1,
            limit: 8,
          }),
          getSiteConfig()
        ]);

        // 格式化文章数据
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
          articles: formattedArticles,
          galleries: galleriesResponse.items,
          stickyNotes: stickyNotesResponse.data,
          siteConfig
        });
      } catch (error) {
        console.error('获取首页数据失败:', error);
        setError(error);
        // 设置默认数据
        const defaultSiteConfig = await getSiteConfig().catch(() => ({
          title: 'CODE SHINE',
          subtitle: '码上拾光',
          description: '在代码间打捞落日余辉',
          icpNumber: '',
          wechatQrcode: '',
          startTime: '2024',
          englishTitle: 'Code Shine',
          heroTitle: { first: 'CODE', second: 'SHINE' },
          socialLinks: {
            github: '',
            email: ''
          },
          seoDefaults: {
            title: '码上拾光',
            description: '在代码间打捞落日余辉',
            keywords: ['技术博客', '编程', '前端', '后端']
          }
        }));
        
        setData({
          articles: [],
          galleries: [],
          stickyNotes: [],
          siteConfig: defaultSiteConfig
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败，请稍后重试</p>
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
    <HomeClient 
      initialArticles={data.articles}
      initialGalleries={data.galleries}
      initialStickyNotes={data.stickyNotes}
      siteConfig={data.siteConfig || undefined}
    />
  );
}
