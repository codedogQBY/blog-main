import { api } from "@/lib/api";
import { getGalleryImages } from "@/lib/gallery-api";
import { getStickyNotes } from '@/lib/sticky-note-api';
import { getSiteConfig } from '@/lib/site-config';
import HomeClient from '@/app/home-client';

async function getHomeData() {
  try {
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

    return {
      articles: formattedArticles,
      galleries: galleriesResponse.items,
      stickyNotes: stickyNotesResponse.data,
      siteConfig
    };
      } catch (error) {
    console.error('获取首页数据失败:', error);
    // 返回默认数据
    return {
      articles: [],
      galleries: [],
      stickyNotes: [],
      siteConfig: await getSiteConfig().catch(() => ({
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
          title: '代码闪耀 - 技术博客',
          description: '分享技术，记录生活',
          keywords: ['技术博客', '编程', '前端', '后端']
        }
      }))
    };
  }
}

export default async function Home() {
  const { articles, galleries, stickyNotes, siteConfig } = await getHomeData();
  
  return (
    <HomeClient 
      initialArticles={articles}
      initialGalleries={galleries}
      initialStickyNotes={stickyNotes}
      siteConfig={siteConfig}
    />
  );
}
