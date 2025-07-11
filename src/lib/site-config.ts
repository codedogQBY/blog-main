const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SiteConfig {
  title: string;
  subtitle: string;
  description: string;
  icpNumber: string;
  wechatQrcode: string;
  startTime: string;
  englishTitle: string;
  heroTitle: {
    first: string;
    second: string;
  };
  socialLinks: {
    github?: string;
    email?: string;
  };
  seoDefaults: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

// 默认的站点配置
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  title: '代码闪耀',
  subtitle: '记录编程生活',
  description: '分享技术，记录生活',
  icpNumber: '',
  wechatQrcode: '',
  startTime: '2024',
  englishTitle: 'Code Shine',
  heroTitle: {
    first: 'CODE',
    second: 'SHINE'
  },
  socialLinks: {
    github: '',
    email: ''
  },
  seoDefaults: {
    title: '代码闪耀 - 技术博客',
    description: '分享技术，记录生活',
    keywords: ['技术博客', '编程', '前端', '后端']
  }
};

// 获取站点配置
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const response = await fetch(`${API_BASE_URL}/system-config`);
    if (!response.ok) {
      throw new Error('Failed to fetch site config');
    }
    const { data } = await response.json() as ApiResponse<SiteConfig>;
    
    return {
      ...DEFAULT_SITE_CONFIG,
      ...data
    };
  } catch (error) {
    console.error('Failed to fetch site config:', error);
    return DEFAULT_SITE_CONFIG;
  }
} 