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
    // 用于缓存的版本
    cacheVersion: `v${packageVersion}-${gitHash || timestamp}`,
    // 用于强制刷新的版本号
    forceUpdateVersion: timestamp
  };

  // 写入版本文件
  const versionFilePath = path.join(__dirname, '../public/version.json');
  fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));



  console.log('✅ 版本信息生成成功:', versionInfo);
  return versionInfo;
}



// 执行脚本
if (require.main === module) {
  generateVersionInfo();
}

module.exports = { generateVersionInfo, cleanOldVersionFiles }; 