// 根据环境自动切换API地址
const API_BASE_URL = (() => {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 根据环境自动选择
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.codeshine.cn';
  }
  
  // 开发环境默认
  return 'http://localhost:3001';
})();

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  slug: string;
  published: boolean;
  views: number;
  readTime?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  _count?: {
    comments: number;
  };
  
  // SEO相关字段
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
  };
}

export interface ApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 文章相关API
  async getArticles(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    tag?: string;
    published?: boolean;
  } = {}): Promise<ApiResponse<Article>> {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString());
      }
    });

    const endpoint = `/articles${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    return this.request<ApiResponse<Article>>(endpoint);
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    return this.request<Article>(`/articles/${slug}`);
  }

  async incrementArticleViews(id: string): Promise<void> {
    await this.request(`/articles/${id}/views`, {
      method: 'POST',
    });
  }

  // 分类相关API
  async getCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    withPublishedArticles?: boolean;
  } = {}): Promise<ApiResponse<Category>> {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString());
      }
    });

    const endpoint = `/categories${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    return this.request<ApiResponse<Category>>(endpoint);
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    return this.request<Category>(`/categories/${slug}`);
  }

  // 通用GET请求方法
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  // 通用POST请求方法
  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 通用PATCH请求方法
  async patch<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 通用DELETE请求方法
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// 创建API客户端实例
export const api = new ApiClient(); 