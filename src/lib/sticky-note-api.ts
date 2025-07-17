// 留言相关的API接口
export interface StickyNoteData {
  id: string;
  content: string;
  author: string;
  category: string;
  color: 'pink' | 'yellow' | 'blue' | 'green' | 'purple';
  status?: 'public' | 'private';
  date: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface CreateStickyNoteData {
  content: string;
  author: string;
  category?: string;
  color?: 'pink' | 'yellow' | 'blue' | 'green' | 'purple';
  status?: 'public' | 'private';
}

export interface StickyNotesResponse {
  data: StickyNoteData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CategoryData {
  name: string;
  count: number;
}

import { api } from './api';

// 获取所有留言
export async function getStickyNotes({
  page = 1,
  limit = 12,
  category,
  search,
}: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
} = {}): Promise<StickyNotesResponse> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (category && category !== '全部') {
    params.append('category', category);
  }
  
  if (search) {
    params.append('search', search);
  }

  const endpoint = `/sticky-notes?${params.toString()}`;
  return api.get<StickyNotesResponse>(endpoint);
}

// 获取单个留言详情
export async function getStickyNote(id: string): Promise<StickyNoteData> {
  return api.get<StickyNoteData>(`/sticky-notes/${id}`);
}

// 创建新留言
export async function createStickyNote(data: CreateStickyNoteData): Promise<StickyNoteData> {
  return api.post<StickyNoteData>('/sticky-notes', data as unknown as Record<string, unknown>);
}

// 获取留言分类
export async function getStickyNoteCategories(): Promise<CategoryData[]> {
  return api.get<CategoryData[]>('/sticky-notes/categories');
}

// 删除留言 (管理员功能)
export async function deleteStickyNote(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sticky-notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('删除留言失败');
  }
}

// 更新留言 (管理员功能)
export async function updateStickyNote(
  id: string, 
  data: Partial<CreateStickyNoteData>, 
  token: string
): Promise<StickyNoteData> {
  const response = await fetch(`${API_BASE_URL}/sticky-notes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '更新留言失败');
  }
  
  return response.json();
}

// 获取留言统计 (管理员功能)
export async function getStickyNoteStats(token: string) {
  const response = await fetch(`${API_BASE_URL}/sticky-notes/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('获取统计信息失败');
  }
  
  return response.json();
} 