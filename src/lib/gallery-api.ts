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

// 图集类型（Gallery Collection）
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  coverImage?: string;  // 封面图片
  images: GalleryImage[];  // 图集包含的所有图片
  status: 'published' | 'draft';
  sort: number;
  createdAt: string;
  updatedAt: string;
  stats?: {
    likes: number;
    comments: number;
    imageCount: number;
  };
}

// 图集中的单张图片
export interface GalleryImage {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  sort: number;
  galleryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryListResponse {
  items: GalleryItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CategoryStats {
  categories: Array<{
    category: string;
    count: number;
  }>;
  total: number;
}

export interface GalleryQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  tag?: string;
  sortBy?: 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// 图库分类接口
export interface GalleryCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  sort: number;
  isEnabled: boolean;
  imageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryCategoryData {
  name: string;
  description?: string;
  color?: string;
  sort?: number;
}

export interface UpdateGalleryCategoryData {
  name?: string;
  description?: string;
  color?: string;
  sort?: number;
  isEnabled?: boolean;
}

class GalleryAPI {
  private baseUrl = `${API_BASE_URL}/gallery`;
  private categoriesUrl = `${API_BASE_URL}/gallery-categories`;

  // ========== 图库管理 ==========
  
  // 获取图库列表
  async getGalleryImages(params: GalleryQueryParams = {}): Promise<GalleryListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.category) searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);
    if (params.tag) searchParams.append('tag', params.tag);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`获取图库列表失败: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取单个图集详情
  async getGalleryItem(id: string): Promise<GalleryItem> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`获取图集失败: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取分类统计
  async getCategoryStats(): Promise<CategoryStats> {
    const response = await fetch(`${this.baseUrl}/stats/categories`);
    
    if (!response.ok) {
      throw new Error(`获取分类统计失败: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取所有标签
  async getAllTags(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/stats/tags`);
    
    if (!response.ok) {
      throw new Error(`获取标签列表失败: ${response.statusText}`);
    }

    return response.json();
  }

  // ========== 图库分类管理 ==========

  // 获取图库分类列表（前台使用）
  async getGalleryCategories(params: {
    includeStats?: boolean;
    enabledOnly?: boolean;
  } = {}): Promise<GalleryCategory[]> {
    const searchParams = new URLSearchParams();
    
    if (params.includeStats !== undefined) {
      searchParams.append('includeStats', params.includeStats.toString());
    }
    if (params.enabledOnly !== undefined) {
      searchParams.append('enabledOnly', params.enabledOnly.toString());
    }

    const response = await fetch(`${this.categoriesUrl}?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`获取图库分类失败: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取分类统计信息
  async getGalleryCategoryStats(): Promise<{
    totalCategories: number;
    enabledCategories: number;
    categoriesWithImages: number;
    totalImages: number;
  }> {
    const response = await fetch(`${this.categoriesUrl}/stats`);
    
    if (!response.ok) {
      throw new Error(`获取分类统计失败: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取单个分类详情
  async getGalleryCategory(id: string): Promise<GalleryCategory> {
    const response = await fetch(`${this.categoriesUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`获取分类详情失败: ${response.statusText}`);
    }

    return response.json();
  }

  // ========== 管理员接口（需要认证） ==========

  // 创建图库分类
  async createGalleryCategory(
    data: CreateGalleryCategoryData,
    token: string
  ): Promise<GalleryCategory> {
    const response = await fetch(`${this.categoriesUrl}/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`创建分类失败: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取所有分类（管理员）
  async getAllGalleryCategories(
    token: string,
    params: {
      includeStats?: boolean;
      enabledOnly?: boolean;
    } = {}
  ): Promise<GalleryCategory[]> {
    const searchParams = new URLSearchParams();
    
    if (params.includeStats !== undefined) {
      searchParams.append('includeStats', params.includeStats.toString());
    }
    if (params.enabledOnly !== undefined) {
      searchParams.append('enabledOnly', params.enabledOnly.toString());
    }

    const response = await fetch(`${this.categoriesUrl}/admin?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`获取分类列表失败: ${response.statusText}`);
    }

    return response.json();
  }

  // 更新图库分类
  async updateGalleryCategory(
    id: string,
    data: UpdateGalleryCategoryData,
    token: string
  ): Promise<GalleryCategory> {
    const response = await fetch(`${this.categoriesUrl}/admin/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`更新分类失败: ${response.statusText}`);
    }

    return response.json();
  }

  // 删除图库分类
  async deleteGalleryCategory(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.categoriesUrl}/admin/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`删除分类失败: ${response.statusText}`);
    }
  }
}

// 创建API实例
export const galleryAPI = new GalleryAPI();

// 导出便捷方法
export const getGalleryImages = (params?: GalleryQueryParams) => 
  galleryAPI.getGalleryImages(params);

export const getGalleryItem = (id: string) => 
  galleryAPI.getGalleryItem(id);

export const getCategoryStats = () => 
  galleryAPI.getCategoryStats();

export const getAllTags = () => 
  galleryAPI.getAllTags();

// 图库分类相关
export const getGalleryCategories = (params?: {
  includeStats?: boolean;
  enabledOnly?: boolean;
}) => galleryAPI.getGalleryCategories(params);

export const getGalleryCategoryStats = () => 
  galleryAPI.getGalleryCategoryStats();

export const getGalleryCategory = (id: string) => 
  galleryAPI.getGalleryCategory(id); 