export interface UserInfo {
  userAgent: string
  deviceType: string
  ipAddress?: string
  browserInfo: {
    name: string
    version: string
    os: string
  }
  timestamp: string
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string
  deviceModel?: string
  osName?: string
  osVersion?: string
  browserName?: string
  browserVersion?: string
  screenWidth?: number
  screenHeight?: number
  language?: string
  languages?: string
  nickname?: string
  email?: string
}

export interface LikeRequest {
  targetType: 'article' | 'sticky_note' | 'gallery_image'
  targetId: string
  fingerprint: string
  userInfo: UserInfo
}

export interface LikeResponse {
  isLiked: boolean
  totalLikes: number
}

export interface CommentRequest {
  targetType: 'article' | 'sticky_note' | 'gallery_image'
  targetId: string
  fingerprint: string
  userInfo: UserInfo
  content: string
  parentId?: string
}

export interface Comment {
  id: string
  content: string
  userInfo: {
    nickname: string
    city: string
    deviceType: string
    browserInfo: {
      name: string
      version: string
      os: string
    } | null
  }
  createdAt: string
  replies: Comment[]
}

export interface CommentResponse {
  comments: Comment[]
  total: number
  hasMore: boolean
  page: number
  limit: number
}

export interface InteractionStats {
  likes: number
  comments: number
  isLiked: boolean
}

class InteractionAPI {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  async toggleLike(request: LikeRequest): Promise<LikeResponse> {
    const response = await fetch(`${this.baseUrl}/interactions/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`点赞失败: ${response.statusText}`)
    }

    return response.json()
  }

  async getLikeStatus(
    targetType: string,
    targetId: string,
    fingerprint: string
  ): Promise<{ isLiked: boolean }> {
    const params = new URLSearchParams({
      targetType,
      targetId,
      fingerprint,
    })

    const response = await fetch(`${this.baseUrl}/interactions/like?${params}`)

    if (!response.ok) {
      throw new Error(`获取点赞状态失败: ${response.statusText}`)
    }

    return response.json()
  }

  async addComment(request: CommentRequest): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/interactions/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`评论失败: ${response.statusText}`)
    }

    return response.json()
  }

  async getComments(
    targetType: string,
    targetId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CommentResponse> {
    const params = new URLSearchParams({
      targetType,
      targetId,
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await fetch(`${this.baseUrl}/interactions/comment?${params}`)

    if (!response.ok) {
      throw new Error(`获取评论失败: ${response.statusText}`)
    }

    return response.json()
  }

  async getInteractionStats(
    targetType: string,
    targetId: string,
    fingerprint: string
  ): Promise<InteractionStats> {
    const params = new URLSearchParams({
      targetType,
      targetId,
      fingerprint,
    })

    const response = await fetch(`${this.baseUrl}/interactions/stats?${params}`)

    if (!response.ok) {
      throw new Error(`获取统计数据失败: ${response.statusText}`)
    }

    return response.json()
  }
}

export const interactionAPI = new InteractionAPI()

// 导出便捷方法
export const toggleLike = (request: LikeRequest) => interactionAPI.toggleLike(request)
export const addComment = (request: CommentRequest) => interactionAPI.addComment(request)
export const getComments = (targetType: string, targetId: string, page?: number, limit?: number) => 
  interactionAPI.getComments(targetType, targetId, page, limit)
export const getInteractionStats = (targetType: string, targetId: string, fingerprint: string) =>
  interactionAPI.getInteractionStats(targetType, targetId, fingerprint) 