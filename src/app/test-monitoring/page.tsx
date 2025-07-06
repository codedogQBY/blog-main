'use client';

import { useEffect, useState } from 'react';

export default function TestMonitoringPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [webSee, setWebSee] = useState<any>(null);

  useEffect(() => {
    // 动态导入 web-see
    const initWebSee = async () => {
      try {
        const webSeeModule = await import('@websee/core');
        const webSeeInstance = webSeeModule.default;
        setWebSee(webSeeInstance);
        
        addLog('WebSee 模块加载成功');
        
        // 手动上报一些测试数据
        if (webSeeInstance) {
          // 测试错误上报
          webSeeInstance.log({
            type: 'error',
            message: '测试错误',
            error: new Error('这是一个测试错误'),
            data: {
              test: true,
              timestamp: Date.now()
            }
          });
          addLog('手动上报错误数据');
          
          // 测试自定义事件
          webSeeInstance.log({
            type: 'custom',
            message: '测试自定义事件',
            data: {
              event: 'test',
              timestamp: Date.now(),
              userAgent: navigator.userAgent
            }
          });
          addLog('手动上报自定义事件');
          
          // 测试性能数据
          webSeeInstance.log({
            type: 'performance',
            name: 'test-performance',
            value: Math.random() * 1000,
            rating: 'good',
            data: {
              test: true,
              timestamp: Date.now()
            }
          });
          addLog('手动上报性能数据');
        }
      } catch (error) {
        addLog(`WebSee 初始化失败: ${error}`);
      }
    };
    
    initWebSee();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testManualReport = async () => {
    try {
      const response = await fetch('/api/logs/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance',
          name: 'manual-test',
          value: Math.random() * 1000,
          rating: 'good',
          time: Date.now(),
          status: 'ok',
          url: window.location.href,
          userAgent: navigator.userAgent,
          apikey: 'blog-frontend',
          userId: 'test-user',
          userName: 'Test User',
          sessionId: 'test-session',
          requestId: 'test-request',
          deviceInfo: {
            browser: navigator.userAgent,
            device: 'desktop'
          },
          pageUrl: window.location.href,
          sdkVersion: '1.0.0',
          uuid: 'test-uuid'
        }),
      });
      
      const result = await response.json();
      addLog(`手动上报结果: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`手动上报失败: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Web-See 监控测试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">测试操作</h2>
          
          <div className="space-y-4">
            <button
              onClick={testManualReport}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              手动上报性能数据
            </button>
            
            <button
              onClick={() => {
                if (webSee) {
                  webSee.log({
                    type: 'custom',
                    message: '按钮点击测试',
                    data: { button: 'test-button', timestamp: Date.now() }
                  });
                  addLog('WebSee 自定义事件上报');
                }
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              测试 WebSee 事件
            </button>
            
            <button
              onClick={() => {
                throw new Error('测试错误');
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              触发测试错误
            </button>
            
            <button
              onClick={clearLogs}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              清空日志
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">日志输出</h2>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">暂无日志</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">页面信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
          </div>
          <div>
            <strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}
          </div>
          <div>
            <strong>WebSee 状态:</strong> {webSee ? '已加载' : '未加载'}
          </div>
          <div>
            <strong>时间戳:</strong> {Date.now()}
          </div>
        </div>
      </div>
    </div>
  );
} 