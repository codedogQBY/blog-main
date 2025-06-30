# 📖 个人博客前端 (Blog Frontend)

一个现代化的个人博客前端展示系统，基于 Next.js 15 和 React 19 构建，提供优雅的博客阅读体验。

## ✨ 特性

- 🚀 **现代技术栈**: Next.js 15 + React 19 + TypeScript
- 🎨 **精美设计**: Tailwind CSS + 响应式设计
- 📱 **移动优化**: 完美适配移动设备
- 🌙 **主题切换**: 支持明暗主题
- 📝 **博客功能**: 文章列表、详情、分类、标签
- 📓 **随记功能**: 生活随记、心情记录、天气展示
- 🖼️ **图片画廊**: 图片展示和筛选
- 💌 **留言墙**: 互动留言功能
- 🔍 **搜索功能**: 全站内容搜索
- ♾️ **无限滚动**: 优化的内容加载体验

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **UI库**: React 19
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **组件**: Headless UI + 自定义组件
- **图标**: Heroicons
- **字体**: Google Fonts (Inter)

## 📦 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── about/             # 关于页面
│   ├── blog/              # 博客相关页面
│   │   ├── [slug]/        # 文章详情页
│   │   └── page.tsx       # 博客列表页
│   ├── diary/             # 随记页面
│   ├── gallery/           # 图片画廊
│   ├── wall/              # 留言墙
│   ├── layout.tsx         # 全局布局
│   └── page.tsx           # 首页
├── components/            # 组件目录
│   ├── blog/              # 博客相关组件
│   ├── diary/             # 随记相关组件
│   ├── gallery/           # 画廊组件
│   ├── header/            # 头部组件
│   ├── ui/                # 通用UI组件
│   └── wall/              # 留言墙组件
├── data/                  # 静态数据
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具库和API
└── types/                 # TypeScript 类型定义
```

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm/pnpm/yarn

### 安装

1. 克隆项目
```bash
git clone <repository-url>
cd blog-main
```

2. 安装依赖
```bash
npm install
# 或
pnpm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. 启动开发服务器
```bash
npm run dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## 🔧 配置说明

### API 配置

在 `src/lib/api.ts` 中配置API基础信息：

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
```

### 主题配置

在 `tailwind.config.js` 中自定义主题：

```javascript
module.exports = {
  // 自定义颜色、字体等
  theme: {
    extend: {
      colors: {
        // 自定义颜色
      }
    }
  }
}
```

## 📄 页面功能

### 🏠 首页
- 最新文章展示
- 功能导航
- 个人简介

### 📝 博客
- 文章列表（支持分页）
- 文章详情（Markdown渲染）
- 分类和标签筛选
- 搜索功能

### 📓 随记
- 生活随记展示
- 心情和天气显示
- 个性化签名
- 时间轴布局

### 🖼️ 画廊
- 图片网格展示
- 分类筛选
- 响应式设计

### 💌 留言墙
- 匿名留言
- 实时显示
- 互动功能

### ℹ️ 关于
- 个人信息
- 技能展示
- 联系方式

## 🎨 UI组件

### 通用组件
- `Button` - 按钮组件
- `Input` - 输入框组件
- `Badge` - 徽章组件
- `CodeBlock` - 代码块组件
- `Tabs` - 标签页组件

### 功能组件
- `ThemeToggle` - 主题切换
- `SearchBox` - 搜索框
- `InfiniteScrollLoader` - 无限滚动加载
- `ScrollToTop` - 返回顶部

## 📱 响应式设计

支持多种设备尺寸：
- 手机：< 768px
- 平板：768px - 1024px
- 桌面：> 1024px

## 🔍 SEO优化

- 动态Meta标签
- 结构化数据
- 语义化HTML
- 优化的图片加载

## 🚀 性能优化

- 代码分割
- 图片懒加载
- 静态资源优化
- 缓存策略

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发规范

- 使用 TypeScript 进行类型安全
- 遵循 ESLint 规则
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 提交信息遵循 Conventional Commits

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Heroicons](https://heroicons.com/) - 图标库
- [React](https://reactjs.org/) - UI 库
