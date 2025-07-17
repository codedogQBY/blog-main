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

// 根据环境自动切换API地址
const API_BASE_URL = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.codeshine.cn';
  }
  return 'http://localhost:3001';
})();

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

  const response = await fetch(`${API_BASE_URL}/sticky-notes?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('获取留言失败');
  }
  
  return response.json();
}

// 获取单个留言详情
export async function getStickyNote(id: string): Promise<StickyNoteData> {
  const response = await fetch(`${API_BASE_URL}/sticky-notes/${id}`);
  
  if (!response.ok) {
    throw new Error('获取留言详情失败');
  }
  
  return response.json();
}

// 创建新留言
export async function createStickyNote(data: CreateStickyNoteData): Promise<StickyNoteData> {
  const response = await fetch(`${API_BASE_URL}/sticky-notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '创建留言失败');
  }
  
  return response.json();
}

// 获取留言分类
export async function getStickyNoteCategories(): Promise<CategoryData[]> {
  const response = await fetch(`${API_BASE_URL}/sticky-notes/categories`);
  
  if (!response.ok) {
    throw new Error('获取分类失败');
  }
  
  return response.json();
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