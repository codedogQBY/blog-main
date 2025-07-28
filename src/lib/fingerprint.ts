import { UAParser } from 'ua-parser-js';
import Fingerprint2 from 'fingerprintjs2';

// 扩展Navigator接口
declare global {
  interface Navigator {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  }
}

// 使用 FingerprintJS2 生成浏览器指纹
async function generateFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      // 服务端环境返回随机指纹
      resolve('server-side-' + Math.random().toString(36).substr(2, 9));
      return;
    }

    try {
      // 配置 FingerprintJS2 选项
      const options = {
        excludes: {
          // 排除一些不稳定的组件
          'adBlock': true,
          'availableScreenResolution': true,
          'enumerateDevices': true
        },
        // 设置超时时间
        timeout: 5000
      };

      Fingerprint2.get(options, (components: any[]) => {
         try {
           // 提取指纹值
           const values = components.map((component: any) => component.value);
          
          // 生成哈希
          const fingerprintString = values.join('|');
          let hash = 0;
          
          for (let i = 0; i < fingerprintString.length; i++) {
            const char = fingerprintString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
          }
          
          const fingerprint = Math.abs(hash).toString(36).padStart(8, '0').substring(0, 32);
          resolve(fingerprint);
        } catch (error) {
          console.warn('指纹处理失败:', error);
          // 降级方案
          const fallbackFingerprint = generateFallbackFingerprint();
          resolve(fallbackFingerprint);
        }
      });
    } catch (error) {
      console.warn('FingerprintJS2 初始化失败:', error);
      // 降级方案
      const fallbackFingerprint = generateFallbackFingerprint();
      resolve(fallbackFingerprint);
    }
  });
}

// 降级方案：生成简单指纹
function generateFallbackFingerprint(): string {
  const fallbackData = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.deviceMemory || 0,
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < fallbackData.length; i++) {
    const char = fallbackData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padStart(8, '0').substring(0, 32);
}

// 获取或生成浏览器指纹
export async function getOrGenerateFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'server-side-' + Math.random().toString(36).substr(2, 9);
  }

  // 检查缓存的指纹和过期时间
  const stored = localStorage.getItem('browser-fingerprint');
  const storedTime = localStorage.getItem('browser-fingerprint-time');
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30天过期

  // 如果有缓存且未过期，直接返回
  if (stored && storedTime && (now - parseInt(storedTime)) < thirtyDays) {
    return stored;
  }

  // 生成新指纹
  const current = await generateFingerprint();
  
  // 存储指纹和时间戳
  localStorage.setItem('browser-fingerprint', current);
  localStorage.setItem('browser-fingerprint-time', now.toString());
  
  return current;
}

// 同步版本的指纹获取（向后兼容）
export function getOrGenerateFingerprintSync(): string {
  if (typeof window === 'undefined') {
    return 'server-side-' + Math.random().toString(36).substr(2, 9);
  }

  // 检查缓存的指纹和过期时间
  const stored = localStorage.getItem('browser-fingerprint');
  const storedTime = localStorage.getItem('browser-fingerprint-time');
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  // 如果有缓存且未过期，直接返回
  if (stored && storedTime && (now - parseInt(storedTime)) < thirtyDays) {
    return stored;
  }
  
  // 如果没有有效的缓存指纹，生成一个简单的降级指纹
  const fallbackFingerprint = generateFallbackFingerprint();
  localStorage.setItem('browser-fingerprint', fallbackFingerprint);
  localStorage.setItem('browser-fingerprint-time', now.toString());
  return fallbackFingerprint;
}

// 获取用户地理位置（使用服务器端 API）
export async function getUserLocation(): Promise<{
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}> {
  try {
    const baseUrl = (() => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (process.env.NODE_ENV === 'production') {
      return 'https://api.codeshine.cn';
    }
    return 'http://localhost:3001';
  })();
    const response = await fetch(`${baseUrl}/interactions/location`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error('获取位置信息失败');
    }
  } catch (error) {
    console.warn('获取位置信息失败:', error);
    return {
      country: '未知',
      region: '未知',
      city: '未知',
      latitude: undefined,
      longitude: undefined,
      timezone: undefined,
    };
  }
}

// 检测设备类型
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'server';

  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  
  return 'desktop';
}

// 收集用户信息
export async function collectUserInfo() {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server-side',
      deviceType: 'server',
      browserInfo: {
        name: 'server',
        version: '',
        os: 'server',
      },
      timestamp: new Date().toISOString(),
    };
  }

  const parser = new UAParser();
  const result = parser.getResult();
  const locationInfo = await getUserLocation();

  return {
    userAgent: navigator.userAgent,
    deviceType: getDeviceType(),
    browserInfo: {
      name: result.browser.name || '未知浏览器',
      version: result.browser.version || '',
      os: result.os.name || '未知系统',
    },
    ...locationInfo,
    screenWidth: screen.width,
    screenHeight: screen.height,
    language: navigator.language,
    osName: result.os.name,
    osVersion: result.os.version,
    browserName: result.browser.name,
    browserVersion: result.browser.version,
    deviceModel: result.device.model,
    timestamp: new Date().toISOString(),
  };
}