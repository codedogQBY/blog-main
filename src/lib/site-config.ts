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
  title: '码上拾光',
  subtitle: '在代码间打捞落日余辉',
  description: '在代码间打捞落日余辉',
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
    title: '码上拾光',
    description: '在代码间打捞落日余辉',
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