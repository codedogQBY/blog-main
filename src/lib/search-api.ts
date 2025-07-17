// 根据环境自动切换API地址
const API_BASE_URL = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.codeshine.cn';
  }
  return 'http://localhost:3001';
})()

export interface SearchResult {
    id: string
    title: string
    type: 'article' | 'diary' | 'gallery'
    excerpt: string
    slug?: string
    publishedAt?: string
    date?: string
    weather?: string
    coverImage?: string
    imageCount?: number
    category?: string | { name: string }
}

export interface SearchResponse {
    articles: SearchResult[]
    diaries: SearchResult[]
    galleries: SearchResult[]
    total: number
}

export async function search(query: string, limit: number = 5): Promise<SearchResponse> {
    try {
        const params = new URLSearchParams({
            q: query,
            limit: limit.toString()
        })
        
        const response = await fetch(`${API_BASE_URL}/search?${params}`)
        
        if (!response.ok) {
            throw new Error('搜索失败')
        }
        
        return await response.json()
    } catch (error) {
        console.error('搜索出错:', error)
        return {
            articles: [],
            diaries: [],
            galleries: [],
            total: 0
        }
    }
} 