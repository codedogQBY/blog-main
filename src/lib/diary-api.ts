const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface DiaryNote {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  images?: string[];
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly-cloudy';
  mood: number;
  status: 'public' | 'private';
  date: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiarySignature {
  id: string;
  signatureName: string;
  fontFamily: string;
  fontSize: string;
  color: string;
  rotation: string;
  isActive: boolean;
}

export interface DiaryWeatherConfig {
  id: string;
  weatherType: string;
  weatherName: string;
  icon?: string;
  description?: string;
  isEnabled: boolean;
  sort: number;
}

export interface DiaryNotesResponse {
  data: DiaryNote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface DiaryStatsResponse {
  totalNotes: number;
  publicNotes: number;
  recentNotes: number;
}

export interface DiaryAdminStatsResponse {
  totalNotes: number;
  publicNotes: number;
  privateNotes: number;
  recentNotes: number;
  weatherStats: Array<{
    weather: string;
    count: number;
  }>;
}

export class DiaryApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/diary`;
  }

  // ======= 公开接口 =======
  
  // 获取随记列表
  async getNotes(params: {
    page?: number;
    limit?: number;
    weather?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<DiaryNotesResponse> {
    const query = new URLSearchParams();
    
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.weather) query.append('weather', params.weather);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.baseUrl}/notes?${query}`);
    if (!response.ok) {
      throw new Error('获取随记列表失败');
    }
    return response.json();
  }

  // 获取单个随记详情
  async getNote(id: string): Promise<DiaryNote> {
    const response = await fetch(`${this.baseUrl}/notes/${id}`);
    if (!response.ok) {
      throw new Error('获取随记详情失败');
    }
    return response.json();
  }

  // 获取统计信息
  async getStats(): Promise<DiaryStatsResponse> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) {
      throw new Error('获取统计信息失败');
    }
    return response.json();
  }

  // 获取当前激活的签名
  async getActiveSignature(): Promise<DiarySignature | null> {
    const response = await fetch(`${this.baseUrl}/signature`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('获取签名失败');
    }
    return response.json();
  }

  // 获取天气配置
  async getWeatherConfigs(): Promise<DiaryWeatherConfig[]> {
    const response = await fetch(`${this.baseUrl}/weather-configs`);
    if (!response.ok) {
      throw new Error('获取天气配置失败');
    }
    return response.json();
  }
}

// 创建单例实例
export const diaryApi = new DiaryApi(); 