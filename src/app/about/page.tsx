import { Metadata } from 'next'
import { getAboutConfig } from "@/lib/about-api"
import AboutClient from './about-client'

// 生成页面元数据
export async function generateMetadata(): Promise<Metadata> {
  try {
    const aboutData = await getAboutConfig()
    
    // 使用intro.content的第一项作为描述
    const description = aboutData?.intro?.content?.[0] || '了解更多关于码上拾光的信息'
    
    return {
      title: '关于我 | 码上拾光',
      description,
      keywords: [
        '关于',
        '个人简介', 
        '技能',
        '经历',
        '联系方式',
        ...(aboutData?.hero?.leftTags || []),
        ...(aboutData?.hero?.rightTags || [])
      ].filter((k): k is string => Boolean(k)),
      authors: [{ name: '码上拾光' }],
      openGraph: {
        title: '关于我 | 码上拾光',
        description,
        type: 'profile',
        locale: 'zh_CN',
        url: '/about',
        siteName: '码上拾光',
        images: aboutData?.hero?.avatar ? [{
          url: aboutData.hero.avatar,
          width: 400,
          height: 400,
          alt: '关于我',
        }] : undefined,
      },
      twitter: {
        card: 'summary',
        title: '关于我 | 码上拾光',
        description,
        images: aboutData?.hero?.avatar ? [aboutData.hero.avatar] : undefined,
      },
      alternates: {
        canonical: '/about',
      },
    }
  } catch (error) {
    console.error('生成关于页面元数据失败:', error)
    return {
      title: '关于我 | 码上拾光',
      description: '了解更多关于码上拾光的信息',
    }
  }
}

// 服务端获取数据
async function getAboutData() {
  try {
    console.log('🚀 服务端获取关于页面数据...')
    const aboutData = await getAboutConfig()
    console.log('✅ 关于页面数据获取成功')
    return aboutData
  } catch (error) {
    console.error('❌ 关于页面数据获取失败:', error)
    return null
  }
}

export default async function AboutPage() {
  const aboutData = await getAboutData()

  return <AboutClient aboutData={aboutData} />
}
