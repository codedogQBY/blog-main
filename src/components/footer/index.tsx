"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { Github, Mail, QrCode, Link2, Server, Globe, Settings } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/auth'
import { getSiteConfig, type SiteConfig } from '@/lib/site-config'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FriendLink {
  id: string
  name: string
  url: string
  logo?: string | null
  description?: string | null
}

interface FriendLinkFormData {
  name: string
  url: string
  logo: string
  description: string
  email: string
}

const TECH_STACK = [
  {
    name: 'Next.js',
    url: 'https://nextjs.org',
    logo: '/next.svg',
    invert: true
  },
  {
    name: 'Nest.js',
    url: 'https://nestjs.com',
    logo: '/nestjs.svg'
  },
  {
    name: 'Cursor',
    url: 'https://cursor.com/',
    logo: '/cursor.png'
  },
  {
    name: 'React',
    url: 'https://react.dev/',
    logo: '/react.svg'
  },
  {
    name: 'Vite',
    url: 'https://vitejs.dev/',
    logo: '/vite.svg'
  },
  {
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com/',
    logo: '/tailwind.png'
  },{
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org/',
    logo: '/typescript.png'
  },
  {
    name: 'Shadcn UI',
    url: 'https://ui.shadcn.com/',
    logo: '/shadcn.png'
  }
]

export default function Footer() {
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([])
  const [runningTime, setRunningTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)
  const [currentYear, setCurrentYear] = useState(2025)
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [formData, setFormData] = useState<FriendLinkFormData>({
    name: '',
    url: '',
    logo: '',
    description: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [authCode, setAuthCode] = useState('')
  const [loginStep, setLoginStep] = useState<'email' | 'twoFactor'>('email')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clickCount, setClickCount] = useState(0)
  const { login } = useAuthStore()

  const handleLogoClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1
      if (newCount >= 5) {
        setLoginDialogOpen(true)
        return 0
      }
      return newCount
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendLinksRes, configRes] = await Promise.all([
          api.get<FriendLink[]>('/friend-links'),
          getSiteConfig()
        ])
        setFriendLinks(friendLinksRes)
        setSiteConfig(configRes)
      } catch (error) {
        console.error('获取数据失败:', error)
        setFriendLinks([])
      }
    }

    fetchData()
    setMounted(true)
    setCurrentYear(new Date().getFullYear())

    // 计算运行时间
    const startTime = siteConfig?.startTime ? new Date(siteConfig.startTime) : new Date(2025, 5, 6, 10, 0, 0)
    const calculateRunningTime = () => {
      const now = new Date()
      const diff = now.getTime() - startTime.getTime()
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setRunningTime({ days, hours, minutes, seconds })
    }

    // 立即设置一次运行时间
    calculateRunningTime()

    // 每秒更新运行时间
    const timer = setInterval(calculateRunningTime, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [siteConfig?.startTime])

  const handleSubmit = async () => {
    if (!formData.name || !formData.url || !formData.email) {
      toast.error('请填写必填项（名称、链接和邮箱）')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('请输入正确的邮箱地址')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post('/friend-links/apply', formData as unknown as Record<string, unknown>)
      toast.success('友链申请已提交，请等待站长审核')
      setDialogOpen(false)
      setFormData({
        name: '',
        url: '',
        logo: '',
        description: '',
        email: ''
      })
    } catch (error) {
      console.error('申请提交失败:', error)
      toast.error('申请提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FriendLinkFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('请输入邮箱和密码')
      return
    }

    try {
      setIsLoggingIn(true)
      const result = await login(email, password)
      
      if (result.success) {
        setLoginDialogOpen(false)
        setEmail('')
        setPassword('')
        setAuthCode('')
        setLoginStep('email')
        toast.success('登录成功')
      } else if (result.needTwoFactor) {
        // 需要2FA验证
        setLoginStep('twoFactor')
        toast.info('请输入验证码')
      } else if (result.notEnabled) {
        // 用户未启用2FA
        toast.error('请先在后台管理系统绑定双因素认证')
      } else {
        toast.error(result.message || '登录失败，只有超级管理员才能登录前台')
      }
    } catch (error) {
      console.error('登录失败:', error)
      toast.error('登录失败，请稍后重试')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleTwoFactorLogin = async () => {
    if (!authCode) {
      toast.error('请输入验证码')
      return
    }

    try {
      setIsLoggingIn(true)
      const result = await login(email, password, authCode)
      
      if (result.success) {
        setLoginDialogOpen(false)
        setEmail('')
        setPassword('')
        setAuthCode('')
        setLoginStep('email')
        toast.success('登录成功')
      } else {
        toast.error('验证码错误，请重新输入')
      }
    } catch (error) {
      console.error('2FA验证失败:', error)
      toast.error('验证失败，请稍后重试')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleBackToEmail = () => {
    setLoginStep('email')
    setAuthCode('')
  }

  return (
    <footer className="mt-auto text-muted-foreground" suppressHydrationWarning>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 友情链接区域 */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="flex items-center gap-2 text-xl font-medium text-foreground">
              友情链接
            </h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Link2 className="h-4 w-4" />
                        <span className="sr-only">申请友链</span>
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>申请添加友链</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>申请友链</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      网站名称 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="请输入您的网站名称"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      网站链接 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="请输入您的网站链接"
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      网站Logo
                    </label>
                    <Input
                      placeholder="请输入您的网站Logo链接"
                      value={formData.logo}
                      onChange={(e) => handleInputChange('logo', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      网站描述
                    </label>
                    <Textarea
                      placeholder="请输入您的网站描述"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      邮箱地址 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="请输入您的邮箱地址"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      用于接收审核结果通知
                    </p>
                  </div>
                  <Button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '提交中...' : '提交申请'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" suppressHydrationWarning>
            {friendLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-lg bg-gray-200/80 p-3 backdrop-blur-md transition-all hover:bg-gray-200/80 dark:bg-white/10 dark:backdrop-blur-md dark:hover:bg-white/20"
              >
                {link.logo ? (
                  <Image
                    width={36}
                    height={36}
                    src={link.logo}
                    alt={link.name}
                    unoptimized={true}
                    className="aspect-square h-9 w-9 rounded-full object-cover ring-1 ring-border/50"
                  />
                ) : (
                  <div className="flex aspect-square h-9 w-9 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground ring-1 ring-border/50">
                    {link.name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-foreground transition-colors group-hover:text-accent-foreground">{link.name}</h3>
                  {link.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1 transition-colors group-hover:text-muted-foreground/80">{link.description}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 中间区域 */}
        <div className="mb-8 grid grid-cols-1 gap-8 border-t border-border py-8 md:grid-cols-4">
          {/* 技术栈 */}
          <div className="md:col-span-3">
            <h3 className="mb-6 text-lg font-medium text-foreground">建站技术</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground sm:gap-6 md:grid-cols-3 lg:grid-cols-4" suppressHydrationWarning>
            {TECH_STACK.map((tech) => (
                <a
                  key={tech.name}
                  href={tech.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-foreground"
                >
                  <Image
                    src={tech.logo}
                    alt={tech.name}
                    width={24}
                    height={24}
                    className={tech.invert ? 'dark:invert' : ''}
                    unoptimized={true}
                    style={{ width: '24px', height: '24px' }}
                  />
                  <span>{tech.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* 联系方式 */}
          <div className="flex flex-col items-start gap-4">
            <h3 className="text-lg font-medium text-foreground">联系我</h3>
            <div className="flex items-center gap-4" suppressHydrationWarning>
              {siteConfig?.socialLinks.github && (
                <a
                  href={siteConfig.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Github size={20} />
                </a>
              )}
              {siteConfig?.wechatQrcode && (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
                      <QrCode size={20} />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 p-0">
                    <Image
                      src={siteConfig.wechatQrcode}
                      alt="WeChat QR Code"
                      width={256}
                      height={256}
                      className="rounded-lg"
                      unoptimized={true}
                    />
                  </HoverCardContent>
                </HoverCard>
              )}
              {siteConfig?.socialLinks.email && (
                <a
                  href={`mailto:${siteConfig.socialLinks.email}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail size={20} />
                </a>
              )}
            </div>
            
            {/* 项目链接 */}
            <div className="mt-4">
              <h4 className="mb-3 text-lg font-medium text-foreground">项目源码</h4>
              <div className="space-y-2" suppressHydrationWarning>
                <a
                  href="https://github.com/codedogQBY/blog-main-server"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Server size={16} />
                  <span>后端服务</span>
                </a>
                <a
                  href="https://github.com/codedogQBY/blog-main"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Globe size={16} />
                  <span>前台页面</span>
                </a>
                <a
                  href="https://github.com/codedogQBY/blog-main-admin"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Settings size={16} />
                  <span>管理后台</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 备案信息 */}
        <div className="flex flex-col items-center gap-3 border-t border-border pt-6 text-center text-sm text-muted-foreground" suppressHydrationWarning>
          <p suppressHydrationWarning>© {currentYear} <span onClick={handleLogoClick}>{siteConfig?.englishTitle || 'Code Shine'}</span>. All rights reserved.</p>
          <p suppressHydrationWarning>
            本站已运行：{mounted ? `${runningTime.days}天${runningTime.hours}时${runningTime.minutes}分${runningTime.seconds}秒` : '加载中...'}
          </p>
          {siteConfig?.icpNumber && (
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {siteConfig.icpNumber}
            </a>
          )}
        </div>
      </div>

      {/* 登录弹窗 */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {loginStep === 'email' ? '登录' : '双因素认证'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loginStep === 'email' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">邮箱</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">密码</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                  />
                </div>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer" 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? '登录中...' : '登录'}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">验证码</label>
                  <Input
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="请输入6位验证码"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    请输入您的身份验证器应用中的6位验证码
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleBackToEmail}
                    className="flex-1"
                  >
                    返回
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer" 
                    onClick={handleTwoFactorLogin}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? '验证中...' : '验证'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  )
} 