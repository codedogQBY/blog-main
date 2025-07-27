import { NextResponse } from 'next/server'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codeshine.cn'
  
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}