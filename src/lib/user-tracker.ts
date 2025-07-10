import { api } from './api';
import { getOrGenerateFingerprint, collectUserInfo } from './fingerprint';

interface ExtendedUserInfo {
  userAgent: string;
  deviceType: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  deviceModel?: string;
  osName?: string;
  osVersion?: string;
  browserName?: string;
  browserVersion?: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  languages?: string;
}

interface BackendUserInfo extends ExtendedUserInfo {
  ipAddress?: string;
  nickname?: string;
  email?: string;
}

// 检查是否需要追踪（避免频繁请求）
function shouldTrack(): boolean {
  const lastTrackTime = localStorage.getItem('lastTrackTime');
  const now = Date.now();
  
  // 如果距离上次追踪不到1小时，则跳过
  if (lastTrackTime && (now - parseInt(lastTrackTime)) < 60 * 60 * 1000) {
    return false;
  }
  
  localStorage.setItem('lastTrackTime', now.toString());
  return true;
}

// 追踪游客信息
export async function trackUser() {
  try {
    // 检查是否需要追踪
    if (!shouldTrack()) {
      return;
    }

    const fingerprint = getOrGenerateFingerprint();
    const userInfo = await collectUserInfo() as ExtendedUserInfo;

    // 转换为后端期望的格式
    const backendUserInfo: BackendUserInfo = {
      userAgent: userInfo.userAgent,
      deviceType: userInfo.deviceType,
      // 不传递IP，让后端自动获取
      ipAddress: undefined,
      country: userInfo.country,
      region: userInfo.region,
      city: userInfo.city,
      latitude: userInfo.latitude,
      longitude: userInfo.longitude,
      timezone: userInfo.timezone,
      deviceModel: userInfo.deviceModel,
      osName: userInfo.osName,
      osVersion: userInfo.osVersion,
      browserName: userInfo.browserName,
      browserVersion: userInfo.browserVersion,
      screenWidth: userInfo.screenWidth,
      screenHeight: userInfo.screenHeight,
      language: userInfo.language,
      languages: userInfo.language,
      nickname: undefined,
      email: undefined,
    };

    await api.post('/user-info/track', {
      fingerprint,
      userInfo: backendUserInfo,
    });
  } catch {
    // 忽略错误
  }
}

// 页面加载完成后自动追踪
export function initUserTracking() {
  // 等待页面完全加载后再追踪
  if (document.readyState === 'complete') {
    trackUser();
  } else {
    window.addEventListener('load', trackUser);
  }
} 