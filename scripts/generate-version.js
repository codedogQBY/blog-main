#!/usr/bin/env node

/* eslint-disable */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 清理旧版本文件
function cleanOldVersionFiles() {
  try {
    console.log('🧹 清理旧版本文件...');
    
    const publicDir = path.join(__dirname, '../public');
    
    if (!fs.existsSync(publicDir)) {
      return;
    }
    
    const files = fs.readdirSync(publicDir);
    let cleanedCount = 0;
    
    // 清理带时间戳的版本文件
    const patterns = [
      /^version\.\d+\.json$/, // version.123456789.json
      /^sw\.\d+\.js$/,        // sw.123456789.js
      /^manifest\.\d+\.json$/ // manifest.123456789.json
    ];
    
    files.forEach(file => {
      const shouldDelete = patterns.some(pattern => pattern.test(file));
      
      if (shouldDelete) {
        const filePath = path.join(publicDir, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️  已删除旧文件: ${file}`);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`✅ 清理完成，共删除 ${cleanedCount} 个旧版本文件`);
    } else {
      console.log('✅ 没有发现需要清理的旧版本文件');
    }
    
  } catch (error) {
    console.warn('⚠️  清理旧版本文件失败:', error.message);
  }
}

// 生成版本信息
function generateVersionInfo() {
  // 先清理旧文件
  cleanOldVersionFiles();
  
  const now = new Date();
  const timestamp = now.getTime();
  const buildDate = now.toISOString();
  
  // 获取git信息（如果有）
  let gitHash = '';
  let gitBranch = '';
  try {
    gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn('Git信息获取失败，使用默认值');
  }

  // 读取package.json获取版本号
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
  const packageVersion = packageJson.version || '1.0.0';

  // 生成版本信息
  const versionInfo = {
    version: packageVersion,
    buildTime: timestamp,
    buildDate: buildDate,
    gitHash: gitHash,
    gitBranch: gitBranch,
    // 用于Service Worker的缓存版本
    cacheVersion: `v${packageVersion}-${gitHash || timestamp}`,
    // 用于强制刷新的版本号
    forceUpdateVersion: timestamp
  };

  // 写入版本文件
  const versionFilePath = path.join(__dirname, '../public/version.json');
  fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));

  // 更新Service Worker中的缓存版本
  updateServiceWorkerVersion(versionInfo.cacheVersion);

  console.log('✅ 版本信息生成成功:', versionInfo);
  return versionInfo;
}

// 更新Service Worker中的缓存版本
function updateServiceWorkerVersion(cacheVersion) {
  const swPath = path.join(__dirname, '../public/sw.js');
  
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf-8');
    
    // 替换缓存版本号
    swContent = swContent.replace(
      /const CACHE_NAME = ['"]blog-cache-v[\d\w\.-]+['"];/,
      `const CACHE_NAME = 'blog-cache-${cacheVersion}';`
    );
    swContent = swContent.replace(
      /const STATIC_CACHE = ['"]blog-static-v[\d\w\.-]+['"];/,
      `const STATIC_CACHE = 'blog-static-${cacheVersion}';`
    );
    swContent = swContent.replace(
      /const DYNAMIC_CACHE = ['"]blog-dynamic-v[\d\w\.-]+['"];/,
      `const DYNAMIC_CACHE = 'blog-dynamic-${cacheVersion}';`
    );
    swContent = swContent.replace(
      /const API_CACHE = ['"]blog-api-v[\d\w\.-]+['"];/,
      `const API_CACHE = 'blog-api-${cacheVersion}';`
    );
    
    fs.writeFileSync(swPath, swContent);
    console.log('✅ Service Worker缓存版本已更新:', cacheVersion);
  }
}

// 执行脚本
if (require.main === module) {
  generateVersionInfo();
}

module.exports = { generateVersionInfo, cleanOldVersionFiles }; 