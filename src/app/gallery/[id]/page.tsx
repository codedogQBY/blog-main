import { Metadata } from 'next'
import { notFound } from "next/navigation"
import { getGalleryItem } from "@/lib/gallery-api"
import type { GalleryItem } from "@/types/gallery"
import GalleryDetailClient from "./gallery-detail-client"

interface GalleryDetailPageProps {
  params: Promise<{ id: string }>
}

// 获取图库数据
async function getGalleryData(id: string): Promise<GalleryItem | null> {
  try {
    console.log('🚀 服务端获取图库详情...', id)
    const gallery = await getGalleryItem(id)
    console.log('✅ 图库详情获取成功:', gallery?.title)
    return gallery
  } catch (error) {
    console.error('❌ 图库详情获取失败:', error)
    return null
  }
}

// 生成页面元数据
export async function generateMetadata({ params }: GalleryDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const gallery = await getGalleryData(id)
  
  if (!gallery) {
    return {
      title: '图库未找到 | 码上拾光',
      description: '该图库不存在或已被删除'
    }
  }

  // 获取第一张图片作为预览
  const previewImage = gallery.coverImage || gallery.images?.[0]?.imageUrl

  return {
    title: `${gallery.title} | 摄影图库 | 码上拾光`,
    description: gallery.description || `查看${gallery.title}的精美图片集合`,
    keywords: [
      '摄影', 
      '图库', 
      '艺术', 
      gallery.title,
      gallery.category,
      ...(gallery.tags || [])
    ].filter((k): k is string => Boolean(k)),
    authors: [{ name: '码上拾光' }],
    openGraph: {
      title: gallery.title,
      description: gallery.description || `查看${gallery.title}的精美图片集合`,
      type: 'article',
      locale: 'zh_CN',
      url: `/gallery/${id}`,
      siteName: '码上拾光',
      images: previewImage ? [{
        url: previewImage,
        width: 1200,
        height: 630,
        alt: gallery.title,
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: gallery.title,
      description: gallery.description || `查看${gallery.title}的精美图片集合`,
      images: previewImage ? [previewImage] : undefined,
    },
    alternates: {
      canonical: `/gallery/${id}`,
    },
  }
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const { id } = await params
  const gallery = await getGalleryData(id)

  if (!gallery) {
    notFound()
  }

  return <GalleryDetailClient gallery={gallery} />
} 