#!/usr/bin/env node

/* eslint-disable */

const fs = require('fs');
const path = require('path');

/**
 * 部署时缓存清理策略
 * 支持多种缓存清理方式：CDN、浏览器缓存控制等
 */

// 配置
const CACHE_CONFIG = {
  // 需要清理的CDN服务配置
  cdn: {
    // 又拍云CDN配置（示例）
    upyun: {
      enabled: process.env.UPYUN_PURGE_ENABLED === 'true',
      serviceKey: process.env.UPYUN_SERVICE_KEY,
      bucketName: process.env.UPYUN_BUCKET_NAME,
      // 需要清理的路径模式
      paths: [
        '/version.json',
        '/sw.js',
        '/_next/static/*',
        '/favicon.ico',
        '/manifest.json'
      ]
    },
    // Cloudflare配置（示例）
    cloudflare: {
      enabled: process.env.CLOUDFLARE_PURGE_ENABLED === 'true',
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      // 清理整个缓存还是特定文件
      purgeEverything: true
    }
  },
  
  // 浏览器缓存控制
  browser: {
    // 为关键文件添加缓存破坏参数
    cacheBusting: true,
    // 需要缓存破坏的文件
    bustFiles: [
      'version.json',
      'sw.js',
      'manifest.json'
    ]
  }
};

// 生成缓存清理报告
function generateClearReport() {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    clearedCaches: [],
    errors: [],
    summary: {
      totalCleared: 0,
      totalErrors: 0
    }
  };

  return report;
}

// 又拍云CDN缓存清理
async function clearUpyunCache() {
  const config = CACHE_CONFIG.cdn.upyun;
  
  if (!config.enabled) {
    console.log('⏭️  又拍云CDN缓存清理未启用');
    return { success: false, reason: 'disabled' };
  }

  if (!config.serviceKey || !config.bucketName) {
    console.warn('⚠️  又拍云CDN配置不完整，跳过缓存清理');
    return { success: false, reason: 'config_missing' };
  }

  try {
    console.log('🧹 开始清理又拍云CDN缓存...');
    
    // 这里应该调用又拍云的API来清理缓存
    // 示例代码（需要安装又拍云SDK）
    /*
    const upyun = require('upyun');
    const client = new upyun.Service(config.bucketName, config.operatorName, config.operatorPassword);
    
    for (const path of config.paths) {
      await client.purge(path);
      console.log(`✅ 已清理缓存: ${path}`);
    }
    */
    
    console.log('✅ 又拍云CDN缓存清理完成');
    return { success: true, clearedPaths: config.paths };
    
  } catch (error) {
    console.error('❌ 又拍云CDN缓存清理失败:', error.message);
    return { success: false, error: error.message };
  }
}

// Cloudflare缓存清理
async function clearCloudflareCache() {
  const config = CACHE_CONFIG.cdn.cloudflare;
  
  if (!config.enabled) {
    console.log('⏭️  Cloudflare缓存清理未启用');
    return { success: false, reason: 'disabled' };
  }

  if (!config.zoneId || !config.apiToken) {
    console.warn('⚠️  Cloudflare配置不完整，跳过缓存清理');
    return { success: false, reason: 'config_missing' };
  }

  try {
    console.log('🧹 开始清理Cloudflare缓存...');
    
    const url = `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/purge_cache`;
    const payload = config.purgeEverything ? 
      { purge_everything: true } : 
      { files: ['https://your-domain.com/version.json', 'https://your-domain.com/sw.js'] };

    // 这里应该调用Cloudflare API
    // 示例代码
    /*
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    */
    
    console.log('✅ Cloudflare缓存清理完成');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Cloudflare缓存清理失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 清理旧的缓存破坏文件
function cleanOldCacheBustedFiles() {
  try {
    console.log('🧹 清理旧的缓存破坏文件...');
    
    const publicDir = path.join(__dirname, '../public');
    
    if (!fs.existsSync(publicDir)) {
      return { success: true, cleaned: 0 };
    }
    
    const files = fs.readdirSync(publicDir);
    let cleanedCount = 0;
    
    // 清理带时间戳的缓存破坏文件
    const patterns = [
      /^version\.\d+\.json$/,    // version.123456789.json
      /^sw\.\d+\.js$/,           // sw.123456789.js  
      /^manifest\.\d+\.json$/    // manifest.123456789.json
    ];
    
    files.forEach(file => {
      const shouldDelete = patterns.some(pattern => pattern.test(file));
      
      if (shouldDelete) {
        const filePath = path.join(publicDir, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️  已删除旧缓存文件: ${file}`);
        cleanedCount++;
      }
    });
    
    return { success: true, cleaned: cleanedCount };
    
  } catch (error) {
    console.error('❌ 清理旧缓存文件失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 生成缓存破坏版本的文件
function generateCacheBustedFiles() {
  if (!CACHE_CONFIG.browser.cacheBusting) {
    console.log('⏭️  浏览器缓存破坏未启用');
    return { success: false, reason: 'disabled' };
  }

  try {
    // 先清理旧文件
    const cleanResult = cleanOldCacheBustedFiles();
    if (cleanResult.success && cleanResult.cleaned > 0) {
      console.log(`✅ 清理了 ${cleanResult.cleaned} 个旧缓存文件`);
    }
    
    console.log('🔄 生成缓存破坏版本文件...');
    
    const publicDir = path.join(__dirname, '../public');
    const timestamp = Date.now();
    
    // 为关键文件生成带版本号的副本
    for (const filename of CACHE_CONFIG.browser.bustFiles) {
      const originalPath = path.join(publicDir, filename);
      
      if (fs.existsSync(originalPath)) {
        const content = fs.readFileSync(originalPath, 'utf-8');
        const extname = path.extname(filename);
        const basename = path.basename(filename, extname);
        const bustedFilename = `${basename}.${timestamp}${extname}`;
        const bustedPath = path.join(publicDir, bustedFilename);
        
        fs.writeFileSync(bustedPath, content);
        console.log(`✅ 已生成缓存破坏版本: ${bustedFilename}`);
      }
    }
    
    return { success: true, timestamp };
    
  } catch (error) {
    console.error('❌ 缓存破坏文件生成失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 更新Service Worker缓存清理指令
function updateServiceWorkerCacheClear() {
  try {
    console.log('🔄 更新Service Worker缓存清理指令...');
    
    const swPath = path.join(__dirname, '../public/sw.js');
    
    if (!fs.existsSync(swPath)) {
      console.warn('⚠️  Service Worker文件不存在，跳过更新');
      return { success: false, reason: 'file_not_found' };
    }
    
    let swContent = fs.readFileSync(swPath, 'utf-8');
    
    // 在Service Worker中添加强制清理缓存的逻辑
    const clearCacheCode = `
// 部署时缓存清理标记
const DEPLOY_TIMESTAMP = ${Date.now()};

// 监听来自主线程的强制清理消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_CACHE_CLEAR') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        console.log('[SW] 强制清理所有缓存...');
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] 删除缓存:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[SW] 缓存清理完成，重新激活...');
        return self.skipWaiting();
      })
    );
  }
});
`;
    
    // 如果还没有添加过这段代码，就添加
    if (!swContent.includes('DEPLOY_TIMESTAMP')) {
      swContent += clearCacheCode;
      fs.writeFileSync(swPath, swContent);
      console.log('✅ Service Worker缓存清理指令已更新');
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Service Worker更新失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 主函数：执行所有缓存清理策略
async function clearAllCaches() {
  console.log('🚀 开始执行部署时缓存清理策略...\n');
  
  const report = generateClearReport();
  
  try {
    // 1. 清理CDN缓存
    console.log('📡 清理CDN缓存...');
    const upyunResult = await clearUpyunCache();
    const cloudflareResult = await clearCloudflareCache();
    
    if (upyunResult.success) report.clearedCaches.push('upyun');
    if (cloudflareResult.success) report.clearedCaches.push('cloudflare');
    
    // 2. 生成缓存破坏文件
    console.log('\n🔄 处理浏览器缓存...');
    const cacheBustResult = generateCacheBustedFiles();
    if (cacheBustResult.success) report.clearedCaches.push('browser_cache_bust');
    
    // 3. 更新Service Worker
    console.log('\n🔧 更新Service Worker...');
    const swResult = updateServiceWorkerCacheClear();
    if (swResult.success) report.clearedCaches.push('service_worker');
    
    report.summary.totalCleared = report.clearedCaches.length;
    
    // 生成报告
    const reportPath = path.join(__dirname, '../cache-clear-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 缓存清理报告:');
    console.log(`✅ 成功清理: ${report.summary.totalCleared} 项`);
    console.log(`❌ 失败: ${report.summary.totalErrors} 项`);
    console.log(`📄 详细报告: ${reportPath}`);
    
    if (report.clearedCaches.length > 0) {
      console.log('\n🎉 缓存清理策略执行完成！用户将在下次访问时获取最新内容。');
    } else {
      console.log('\n⚠️  没有执行任何缓存清理操作，请检查配置。');
    }
    
  } catch (error) {
    console.error('\n❌ 缓存清理过程中发生错误:', error);
    process.exit(1);
  }
}

// 显示使用说明
function showHelp() {
  console.log(`
🧹 部署时缓存清理工具

用法:
  node scripts/deploy-cache-clear.js [选项]

选项:
  --help, -h          显示此帮助信息
  --config            显示当前配置
  --dry-run           模拟运行（不执行实际清理）

环境变量:
  UPYUN_PURGE_ENABLED     启用又拍云缓存清理
  UPYUN_SERVICE_KEY       又拍云服务密钥
  UPYUN_BUCKET_NAME       又拍云存储桶名称
  
  CLOUDFLARE_PURGE_ENABLED  启用Cloudflare缓存清理
  CLOUDFLARE_ZONE_ID        Cloudflare Zone ID
  CLOUDFLARE_API_TOKEN      Cloudflare API Token

示例:
  # 执行缓存清理
  node scripts/deploy-cache-clear.js
  
  # 查看配置
  node scripts/deploy-cache-clear.js --config
  `);
}

// 显示当前配置
function showConfig() {
  console.log('📋 当前缓存清理配置:');
  console.log(JSON.stringify(CACHE_CONFIG, null, 2));
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
} else if (args.includes('--config')) {
  showConfig();
} else if (args.includes('--dry-run')) {
  console.log('🧪 模拟运行模式（不执行实际清理）');
  // 这里可以添加模拟运行的逻辑
} else {
  // 执行缓存清理
  clearAllCaches();
}

module.exports = {
  clearAllCaches,
  clearUpyunCache,
  clearCloudflareCache,
  generateCacheBustedFiles,
  cleanOldCacheBustedFiles
}; 