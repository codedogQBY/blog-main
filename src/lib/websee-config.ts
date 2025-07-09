// 只在客户端导入 web-see
let webSee: any = null;
let performance: any = null;
let recordscreen: any = null;

if (typeof window !== 'undefined') {
  // 动态导入，避免服务端渲染问题
  import('@websee/core').then(module => {
    webSee = module.default;
  });
  import('@websee/performance').then(module => {
    performance = module.default;
  });
  import('@websee/recordscreen').then(module => {
    recordscreen = module.default;
  });
}

// 全局变量存储 webSee 实例
let webseeInstance: any = null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// web-see 配置
export const webseeConfig = {
  // 基础配置
  dsn: API_BASE_URL + '/logs/report',
  apikey: 'blog-frontend',
  userId: 'anonymous',
  
  // 错误监控配置
  error: {
    // 忽略一些常见的非关键错误
    ignore: [
      /Script error/,
      /ResizeObserver loop limit exceeded/,
      /Network request failed/,
    ],
  },
  
  // 上报配置
  report: {
    // 批量上报
    batch: true,
    batchSize: 10,
    batchDelay: 3000,
  },
  
  // 设备信息收集
  device: {
    collect: true,
  },
  
  // 用户行为追踪
  behavior: {
    collect: true,
    // 记录页面访问
    pageView: true,
    // 记录用户点击
    click: true,
  },
}

// 初始化web-see监控
export function initWebSee(userId?: string) {
  if (typeof window === 'undefined') return;
  
  // 等待模块加载完成
  const initMonitoring = async () => {
    try {
      if (!webSee) {
        const webSeeModule = await import('@websee/core');
        webSee = webSeeModule.default;
      }
      if (!performance) {
        const performanceModule = await import('@websee/performance');
        performance = performanceModule.default;
      }
      if (!recordscreen) {
        const recordscreenModule = await import('@websee/recordscreen');
        recordscreen = recordscreenModule.default;
      }
      
      // 使用配置初始化
      const config = {
        ...webseeConfig,
        userId: userId || webseeConfig.userId,
      };
      
      webSee.init(config);

      // 注册性能监控插件
      webSee.use(performance);
      
      // 注册录屏插件
      webSee.use(recordscreen);
      
      // 自定义长任务监听器，只上报大于500ms的长任务
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        try {
          const longTaskObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              // 只处理大于500ms的长任务
              if (entry.duration > 500) {
                webSee.log({
                  type: 'longTask',
                  message: `Long task detected: ${entry.duration}ms`,
                  data: {
                    duration: entry.duration,
                    startTime: entry.startTime,
                    name: entry.name,
                    entryType: entry.entryType,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                  }
                });
              }
            });
          });
          
          // 开始观察长任务
          longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (error) {
          console.warn('Failed to setup custom long task observer:', error);
        }
      }
      
      console.log('WebSee monitoring initialized successfully');
      
      // 手动上报页面加载完成事件
      if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
          setTimeout(() => {
            // 手动上报页面加载性能
            webSee.log({
              type: 'custom',
              message: 'Page Load Complete',
              data: {
                pageLoadTime: window.performance.now(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
              }
            });
          }, 1000);
        });
      }
    } catch (error) {
      console.error('Failed to initialize WebSee monitoring:', error);
    }
  };
  
  initMonitoring();
}

// 手动上报错误
export function reportError(error: Error, context?: any) {
  if (typeof window === 'undefined' || !webSee) return;
  
  webSee.log({
    type: 'custom',
    message: error.message,
    error: error,
    data: context
  });
}

// 手动上报自定义日志
export function reportLog(message: string, data?: any) {
  if (typeof window === 'undefined' || !webSee) return;
  
  webSee.log({
    type: 'custom',
    message,
    data
  });
}

// 手动上报性能数据
export function reportPerformance(performanceData: any) {
  if (typeof window === 'undefined' || !webSee) return;
  
  webSee.log({
    type: 'custom',
    message: 'Custom Performance Data',
    data: performanceData
  });
}

export default webSee; 