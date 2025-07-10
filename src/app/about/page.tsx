import { Metadata } from "next"
import { getAboutConfig } from "@/lib/about-api"
import type { AboutConfig } from "@/types/about"
import AboutClient from './about-client'

async function getAboutData(): Promise<AboutConfig | null> {
  try {
    return await getAboutConfig()
            } catch (error) {
                console.error("Failed to load about data:", error)
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const aboutData = await getAboutData()
  
  return {
    title: `关于我们 | 码上拾光`,
    description: aboutData?.intro?.content?.[0] || '了解我们的故事、理念和团队',
    openGraph: {
      title: `关于我们 | 码上拾光`,
      description: aboutData?.intro?.content?.[0] || '了解我们的故事、理念和团队',
      type: 'website',
    },
    alternates: {
      canonical: '/about',
    },
  }
}

export default async function AboutPage() {
  const aboutData = await getAboutData()

  return <AboutClient aboutData={aboutData} />
}
