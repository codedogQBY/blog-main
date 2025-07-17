# API 配置说明

## 环境变量配置

前台项目支持通过环境变量配置API地址：

### 开发环境
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 生产环境
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.codeshine.cn
```

## 自动环境检测

如果没有设置 `NEXT_PUBLIC_API_URL` 环境变量，系统会根据 `NODE_ENV` 自动选择：

- **开发环境** (`NODE_ENV=development`): `http://localhost:3001`
- **生产环境** (`NODE_ENV=production`): `https://api.codeshine.cn`

## 已修改的文件

以下文件已更新为支持环境自动切换：

- `src/lib/api.ts` - 主要API客户端
- `src/lib/gallery-api.ts` - 图集API
- `src/lib/interaction-api.ts` - 互动API
- `src/lib/search-api.ts` - 搜索API
- `src/lib/websee-config.ts` - 监控配置
- `src/lib/diary-api.ts` - 随记API
- `src/lib/site-config.ts` - 站点配置API
- `src/lib/fingerprint.ts` - 指纹识别API
- `src/lib/sticky-note-api.ts` - 留言墙API
- `src/lib/sw-config.ts` - Service Worker配置
- `public/sw.js` - Service Worker文件

## 部署说明

### 开发环境
```bash
npm run dev
# 自动使用 http://localhost:3001
```

### 生产环境构建
```bash
npm run build
npm start
# 自动使用 https://api.codeshine.cn
```

### 自定义API地址
如果需要使用自定义API地址，可以设置环境变量：
```bash
export NEXT_PUBLIC_API_URL=https://your-custom-api.com
npm run build
``` 