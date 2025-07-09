import { api } from './api';
import { getOrGenerateFingerprint, collectUserInfo } from './fingerprint';

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
    const userInfo = await collectUserInfo();

    // 转换为后端期望的格式
    const backendUserInfo = {
      userAgent: userInfo.userAgent,
      deviceType: userInfo.deviceType,
      // 不传递IP，让后端自动获取
      ipAddress: undefined,
      country: (userInfo as any).country,
      region: (userInfo as any).region,
      city: (userInfo as any).city,
      latitude: (userInfo as any).latitude,
      longitude: (userInfo as any).longitude,
      timezone: (userInfo as any).timezone,
      deviceModel: (userInfo as any).deviceModel,
      osName: (userInfo as any).osName,
      osVersion: (userInfo as any).osVersion,
      browserName: (userInfo as any).browserName,
      browserVersion: (userInfo as any).browserVersion,
      screenWidth: (userInfo as any).screenWidth,
      screenHeight: (userInfo as any).screenHeight,
      language: (userInfo as any).language,
      languages: (userInfo as any).language,
      nickname: undefined,
      email: undefined,
    };

    await api.post('/user-info/track', {
      fingerprint,
      userInfo: backendUserInfo,
    });
  } catch (error) {
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