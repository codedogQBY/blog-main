// 版本管理工具
interface VersionInfo {
  version: string;
  buildTime: number;
  buildDate: string;
  gitHash: string;
  gitBranch: string;
  cacheVersion: string;
  forceUpdateVersion: number;
}

interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: VersionInfo | null;
  latestVersion: VersionInfo | null;
  shouldForceUpdate: boolean;
}

class VersionManager {
  private currentVersion: VersionInfo | null = null;
  private checkInterval: number = 5 * 60 * 1000; // 5分钟检查一次
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheckTime: number = 0;
  private onUpdateCallback: ((result: UpdateCheckResult) => void) | null = null;

  constructor() {
    this.loadCurrentVersion();
  }

  // 加载当前版本信息
  private async loadCurrentVersion(): Promise<void> {
    try {
      const response = await fetch('/version.json');
      if (response.ok) {
        this.currentVersion = await response.json();
        console.log('[Version] Current version loaded:', this.currentVersion);
      }
    } catch (error) {
      console.warn('[Version] Failed to load current version:', error);
    }
  }

  // 检查是否有更新
  async checkForUpdate(force: boolean = false): Promise<UpdateCheckResult> {
    const now = Date.now();
    
    // 如果不是强制检查且距离上次检查时间太短，跳过
    if (!force && now - this.lastCheckTime < 30000) { // 30秒内不重复检查
      return {
        hasUpdate: false,
        currentVersion: this.currentVersion,
        latestVersion: null,
        shouldForceUpdate: false
      };
    }

    this.lastCheckTime = now;

    try {
      // 添加时间戳避免缓存
      const response = await fetch(`/version.json?t=${now}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const latestVersion: VersionInfo = await response.json();
      
      if (!this.currentVersion) {
        this.currentVersion = latestVersion;
        return {
          hasUpdate: false,
          currentVersion: this.currentVersion,
          latestVersion: latestVersion,
          shouldForceUpdate: false
        };
      }

      // 比较版本
      const hasUpdate = this.compareVersions(this.currentVersion, latestVersion);
      const shouldForceUpdate = this.shouldForceUpdate(this.currentVersion, latestVersion);

      console.log('[Version] Update check result:', {
        hasUpdate,
        shouldForceUpdate,
        currentBuildTime: this.currentVersion.buildTime,
        latestBuildTime: latestVersion.buildTime
      });

      return {
        hasUpdate,
        currentVersion: this.currentVersion,
        latestVersion: latestVersion,
        shouldForceUpdate
      };

    } catch (error) {
      console.error('[Version] Failed to check for updates:', error);
      return {
        hasUpdate: false,
        currentVersion: this.currentVersion,
        latestVersion: null,
        shouldForceUpdate: false
      };
    }
  }

  // 比较版本是否有更新
  private compareVersions(current: VersionInfo, latest: VersionInfo): boolean {
    // 比较构建时间戳
    return latest.buildTime > current.buildTime;
  }

  // 判断是否需要强制更新
  private shouldForceUpdate(current: VersionInfo, latest: VersionInfo): boolean {
    // 如果版本号不同或强制更新版本号不同，需要强制更新
    return current.version !== latest.version || 
           current.forceUpdateVersion !== latest.forceUpdateVersion;
  }

  // 启动自动检查
  startAutoCheck(callback?: (result: UpdateCheckResult) => void): void {
    this.onUpdateCallback = callback || null;

    // 清除现有定时器
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // 立即检查一次
    this.checkForUpdate().then(result => {
      if (result.hasUpdate && this.onUpdateCallback) {
        this.onUpdateCallback(result);
      }
    });

    // 设置定时检查
    this.intervalId = setInterval(async () => {
      const result = await this.checkForUpdate();
      if (result.hasUpdate && this.onUpdateCallback) {
        this.onUpdateCallback(result);
      }
    }, this.checkInterval);

    // 页面可见性变化时检查
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdate().then(result => {
          if (result.hasUpdate && this.onUpdateCallback) {
            this.onUpdateCallback(result);
          }
        });
      }
    });

    console.log('[Version] Auto check started');
  }

  // 停止自动检查
  stopAutoCheck(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.onUpdateCallback = null;
    console.log('[Version] Auto check stopped');
  }

  // 强制刷新页面和缓存
  async forceRefresh(): Promise<void> {
    try {
      // 清理浏览器缓存
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      console.log('[Version] Cache cleared, reloading page...');
      
      // 强制刷新页面（不使用缓存）
      window.location.reload();
      
    } catch (error) {
      console.error('[Version] Failed to force refresh:', error);
      // 备用刷新方法
      window.location.href = window.location.href + '?v=' + Date.now();
    }
  }

  // 获取当前版本信息
  getCurrentVersion(): VersionInfo | null {
    return this.currentVersion;
  }

  // 设置检查间隔
  setCheckInterval(interval: number): void {
    this.checkInterval = interval;
    if (this.intervalId) {
      this.stopAutoCheck();
      this.startAutoCheck(this.onUpdateCallback || undefined);
    }
  }
}

// 创建全局实例
export const versionManager = new VersionManager();

// 便捷方法
export const checkForUpdate = () => versionManager.checkForUpdate();
export const forceRefresh = () => versionManager.forceRefresh();
export const startAutoCheck = (callback?: (result: UpdateCheckResult) => void) => 
  versionManager.startAutoCheck(callback);
export const stopAutoCheck = () => versionManager.stopAutoCheck();

export type { VersionInfo, UpdateCheckResult }; 