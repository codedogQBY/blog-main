// web-see 手动上报错误示例

// 手动上报错误
export function reportError(error: Error, context?: string) {
  if (typeof window === 'undefined') return;
  
  import('@websee/core').then(module => {
    const webSee = module.default;
    // 手动上报错误
    webSee.log({
      type: 'error',
      message: error.message,
      stack: error.stack,
      context: context || 'manual-report'
    });
  }).catch(err => {
    console.error('Failed to report error to web-see:', err);
  });
}

// 手动上报性能数据
export function reportPerformance(metric: string, value: number) {
  if (typeof window === 'undefined') return;
  
  import('@websee/core').then(module => {
    const webSee = module.default;
    webSee.log({
      type: 'performance',
      metric,
      value,
      timestamp: Date.now()
    });
  }).catch(err => {
    console.error('Failed to report performance to web-see:', err);
  });
}

// 手动上报用户行为
export function reportUserAction(action: string, data?: any) {
  if (typeof window === 'undefined') return;
  
  import('@websee/core').then(module => {
    const webSee = module.default;
    webSee.log({
      type: 'user-action',
      action,
      data,
      timestamp: Date.now()
    });
  }).catch(err => {
    console.error('Failed to report user action to web-see:', err);
    });
}

// 测试函数：模拟各种错误
export function testWebSeeErrors() {
  // 测试 JavaScript 错误
  try {
    throw new Error('测试 JavaScript 错误');
  } catch (error) {
    reportError(error as Error, 'test-javascript-error');
  }
  
  // 测试异步错误
  setTimeout(() => {
    try {
      throw new Error('测试异步错误');
    } catch (error) {
      reportError(error as Error, 'test-async-error');
    }
  }, 1000);
  
  // 测试 Promise 错误
  Promise.reject(new Error('测试 Promise 错误')).catch(error => {
    reportError(error, 'test-promise-error');
  });
  
  // 测试用户行为
  reportUserAction('test-click', { element: 'button', text: '测试按钮' });
  
  // 测试性能数据
  reportPerformance('custom-metric', 123.45);
}

// 测试网络请求错误
export function testNetworkError() {
  fetch('/api/non-existent-endpoint')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .catch(error => {
      reportError(error, 'test-network-error');
    });
}

// 测试资源加载错误
export function testResourceError() {
  const img = new Image();
  img.onerror = () => {
    reportError(new Error('图片加载失败'), 'test-resource-error');
  };
  img.src = '/non-existent-image.jpg';
} 