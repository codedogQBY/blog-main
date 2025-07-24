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

// 获取客户端IP地址和位置信息
async function getClientIpAndLocation(): Promise<{ ip?: string; location?: {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  loc?: string;
  org?: string;
  postal?: string;
} }> {
  try {
    const response = await fetch('https://ipinfo.io/json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // 设置较短的超时时间
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ip: data.ip,
        location: {
          country: data.country,
          region: data.region,
          city: data.city,
          timezone: data.timezone,
          loc: data.loc, // 经纬度
          org: data.org, // 网络服务商
          postal: data.postal
        }
      };
    }
  } catch (error) {
    console.warn('获取IP地址和位置信息失败:', error);
  }
  
  return { ip: undefined, location: undefined };
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
    
    // 尝试获取IP地址和位置信息
    const { ip: ipAddress, location } = await getClientIpAndLocation();

    // 转换为后端期望的格式
    const backendUserInfo: BackendUserInfo = {
      userAgent: userInfo.userAgent,
      deviceType: userInfo.deviceType,
      ipAddress: ipAddress,
      // 优先使用 ipinfo.io 的位置信息，如果没有则使用浏览器获取的信息
      country: location?.country || userInfo.country,
      region: location?.region || userInfo.region,
      city: location?.city || userInfo.city,
      latitude: location?.loc ? parseFloat(location.loc.split(',')[0]) : userInfo.latitude,
      longitude: location?.loc ? parseFloat(location.loc.split(',')[1]) : userInfo.longitude,
      timezone: location?.timezone || userInfo.timezone,
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
  } catch (error) {
    console.warn('用户追踪失败:', error);
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