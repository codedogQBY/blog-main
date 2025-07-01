import { api } from './api'
import type { AboutConfig } from '@/types/about'

// 获取关于页面配置
export async function getAboutConfig(): Promise<AboutConfig | null> {
  try {
    const response = await api.get<AboutConfig>('/about/config')
    return response
  } catch (error) {
    console.error('Failed to fetch about config:', error)
    return null
  }
} 