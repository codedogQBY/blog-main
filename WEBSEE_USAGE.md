# Web-See 前端监控使用说明

## 概述

本项目集成了 [web-see](https://github.com/xy-sea/web-see) 前端监控 SDK，用于收集和上报前端错误、性能数据、用户行为等信息。

## 功能特性

- ✅ 错误捕获：JavaScript 错误、资源加载错误、网络请求错误
- ✅ 性能监控：页面加载性能、用户交互性能
- ✅ 用户行为：点击事件、路由跳转、页面访问
- ✅ 白屏检测：检测页面是否出现白屏
- ✅ 错误去重：避免重复上报相同错误
- ✅ 录屏功能：错误发生时的页面录屏
- ✅ 手动上报：支持手动上报自定义数据

## 配置说明

### 主要配置项

```typescript
{
  dsn: 'http://localhost:3001/logs/report', // 上报地址
  apikey: 'blog-frontend', // 项目标识
  userId: '', // 用户ID
  disabled: false, // 是否禁用监控
  silentWhiteScreen: true, // 开启白屏检测
  skeletonProject: false, // 是否有骨架屏
  repeatCodeError: true, // 错误去重
  throttleDelayTime: 0, // 点击事件节流时间
  overTime: 10, // 接口超时时间
  maxBreadcrumbs: 10, // 用户行为栈最大数量
  whiteBoxElements: ['html', 'body', '#__next', '#root'], // 白屏检测容器
  filterXhrUrlRegExp: /\/logs\/report/, // 过滤的接口请求
}
```

### 自定义 Hook

#### handleHttpStatus
根据接口返回判断请求是否正确：

```typescript
handleHttpStatus(data) {
  const { url, response, Status } = data;
  
  // 过滤监控上报接口
  if (url.includes('/logs/report')) return true;
  
  // HTTP 状态码判断
  if (Status >= 200 && Status < 300) return true;
  
  // 自定义业务逻辑判断
  if (response && response.code === 200) return true;
  
  return false;
}
```

#### beforeDataReport
数据上报前的处理：

```typescript
beforeDataReport(data) {
  // 数据大小限制
  const maxSize = 5 * 1024 * 1024; // 5MB
  const dataStr = JSON.stringify(data);
  
  if (dataStr.length > maxSize) {
    // 截断数据
    if (data.message) {
      data.message = data.message.substring(0, 1000) + '...';
    }
    // 移除录屏数据
    if (data.recordScreen) {
      data.recordScreen = undefined;
    }
  }
  
  return data;
}
```

## 使用方法

### 1. 自动监控

监控系统会在页面加载时自动初始化，无需手动配置。

### 2. 手动上报

```typescript
import { reportError, reportPerformance, reportUserAction } from '@/lib/websee-examples';

// 上报错误
reportError(new Error('自定义错误'), 'custom-context');

// 上报性能数据
reportPerformance('custom-metric', 123.45);

// 上报用户行为
reportUserAction('button-click', { buttonId: 'submit' });
```

### 3. 测试功能

```typescript
import { testWebSeeErrors, testNetworkError, testResourceError } from '@/lib/websee-examples';

// 测试各种错误
testWebSeeErrors();

// 测试网络错误
testNetworkError();

// 测试资源加载错误
testResourceError();
```

## 错误边界

项目使用了 React ErrorBoundary 来捕获组件错误：

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## 插件配置

### 性能监控插件

```typescript
webSee.use(performance);
```

### 录屏插件

```typescript
webSee.use(recordscreen, {
  recordScreentime: 5, // 录屏时长（秒）
  recordScreenTypeList: ['error', 'unhandledrejection'] // 录屏触发条件
});
```

## 数据格式

### 错误数据

```typescript
{
  type: 'error',
  message: '错误信息',
  fileName: '错误文件',
  line: 行号,
  column: 列号,
  stack: '错误堆栈',
  time: 时间戳
}
```

### 性能数据

```typescript
{
  type: 'performance',
  metric: '指标名称',
  value: 数值,
  timestamp: 时间戳
}
```

### 用户行为

```typescript
{
  type: 'user-action',
  action: '行为类型',
  data: 行为数据,
  timestamp: 时间戳
}
```

## 开发调试

### 查看控制台日志

监控系统会在控制台输出详细的调试信息：

- `WebSee DSN:` - 上报地址
- `WebSee handleHttpStatus called with data:` - HTTP 状态处理
- `WebSee monitoring initialized successfully` - 初始化成功

### 禁用监控

在开发环境中，可以通过设置 `disabled: true` 来禁用监控：

```typescript
webSee.init({
  disabled: true, // 禁用监控
  // ... 其他配置
});
```

## 注意事项

1. **服务端渲染兼容**：使用动态导入避免 SSR 问题
2. **数据大小限制**：自动截断过大的数据
3. **错误去重**：避免重复上报相同错误
4. **隐私保护**：不收集敏感用户信息
5. **性能影响**：监控系统对页面性能影响很小

## 相关文件

- `src/lib/websee-config.ts` - 监控配置
- `src/components/monitoring-initializer.tsx` - 监控初始化
- `src/components/error-boundary.tsx` - 错误边界
- `src/lib/websee-examples.ts` - 使用示例
- `src/app/api/logs/report/route.ts` - 上报接口

## 更多信息

- [Web-See 官方文档](https://github.com/xy-sea/web-see)
- [Web-See 源码](https://github.com/xy-sea/web-see) 