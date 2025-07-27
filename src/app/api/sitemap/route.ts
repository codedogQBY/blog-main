import { NextResponse } from 'next/server'
import { Article } from '@/lib/api'

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codeshine.cn'
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.codeshine.cn'
    
    // 获取所有已发布的文章
    const response = await fetch(`${apiUrl}/articles?page=1&limit=1000&published=true`)
    const { data: articles } = await response.json()
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${articles.map((article: Article) => `
  <url>
    <loc>${siteUrl}/blog/${article.slug}</loc>
    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}