import { NextResponse } from 'next/server'
import { Article } from '@/lib/api'

// RSS feed生成函数
function generateRSSFeed(articles: Article[], siteUrl: string) {
  const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>CodeShine Blog</title>
    <description>个人技术博客，分享编程技术与生活感悟</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Next.js RSS Generator</generator>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>CodeShine Blog</title>
      <link>${siteUrl}</link>
    </image>`

  const rssItems = articles.map(article => {
    const pubDate = article.publishedAt ? new Date(article.publishedAt).toUTCString() : new Date(article.createdAt).toUTCString()
    const articleUrl = `${siteUrl}/blog/${article.slug}`
    
    // 构建富文本内容，在正文前面添加封面图
    let contentWithCover = ''
    
    // 如果有封面图片，在正文前面添加封面图片
    if (article.coverImage) {
      contentWithCover += `<img src="${article.coverImage}" width="800" style="max-width: 100%; height: auto; margin-bottom: 20px;"> `
    }
    
    // 添加文章正文内容
    contentWithCover += article.content
    
    return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <content:encoded><![CDATA[${contentWithCover}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>noreply@codeshine.cn (${article.author.name})</author>
      <category><![CDATA[${article.category.name}]]></category>
      ${article.tags.map(tag => `<category><![CDATA[${tag.tag.name}]]></category>`).join('')}
    </item>`
  }).join('')

  const rssFooter = `
  </channel>
</rss>`

  return rssHeader + rssItems + rssFooter
}

export async function GET() {
  try {
    // 获取站点URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codeshine.cn'
    
    // 获取后端API地址
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.codeshine.cn'
    
    // 调用后端API获取最新文章（只获取已发布的文章）
    const response = await fetch(`${apiUrl}/articles?page=1&limit=20&published=true`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch articles')
    }

    const { data: articles } = await response.json()
    
    // 生成RSS XML
    const rssXml = generateRSSFeed(articles, siteUrl)

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // 缓存1小时
      },
    })
  } catch (error) {
    console.error('RSS generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}