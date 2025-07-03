import { UAParser } from 'ua-parser-js';

// 扩展Navigator接口
declare global {
  interface Navigator {
    deviceMemory?: number;
  }
}

// 生成浏览器指纹
function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 0,
    navigator.deviceMemory || 0,
  ].join('|');

  return btoa(fingerprint).replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
}

// 获取或生成浏览器指纹
export function getOrGenerateFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side-' + Math.random().toString(36).substr(2, 9);
  }

  const stored = localStorage.getItem('browser-fingerprint');
  const current = generateFingerprint();
  
  // 如果存储的指纹不存在或者与当前生成的不一致（可能被篡改），使用新生成的
  if (!stored || stored !== current) {
    localStorage.setItem('browser-fingerprint', current);
    return current;
  }
  
  return stored;
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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