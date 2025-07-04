import { Share2, Copy, Download, Triangle } from 'lucide-react'
import { Button } from '../ui/button'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../ui/hover-card'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../ui/dialog'
import { toast } from 'sonner'
import { snapdom } from '@zumer/snapdom'
import QRCode from 'qrcode'
import { useRef, useState, useEffect } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface ShareButtonProps {
    title: string
    url: string
    coverImage?: string
}

interface ShareCardContentProps {
    cardRef: React.Ref<HTMLDivElement>
    title: string
    coverImage?: string
    coverImageBase64: string
    qrCodeUrl: string
}

// 分享卡片内容组件
const ShareCardContent = ({ 
    cardRef,
    title,
    coverImage,
    coverImageBase64,
    qrCodeUrl
}: ShareCardContentProps) => {
    return (
        <div 
            ref={cardRef}
            className="w-[300px] md:w-[280px] h-[420px] md:h-[460px] bg-gradient-to-br from-sky-200 via-blue-100 to-purple-200 shadow-lg p-4 md:p-6 flex flex-col justify-between"
            style={{ borderRadius: '20px' }}
        >
            {/* YIKE Logo */}
            <div className="flex justify-center mb-3 md:mb-4">
                <div className="flex items-center space-x-1.5">
                    <div className="relative">
                        <Triangle className="w-4 h-4 md:w-5 md:h-5 text-cyan-500 fill-current rotate-90" />
                        <Triangle className="w-4 h-4 md:w-5 md:h-5 text-cyan-500 fill-current absolute -top-0.5 -left-0.5 rotate-45" />
                    </div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-800">YIKE</h1>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="flex-1 flex flex-col items-center">
                {/* Image */}
                {coverImage && coverImageBase64 && (
                    <div className="mb-3 md:mb-4">
                        <div className="w-56 md:w-56 h-32 md:h-[136px] overflow-hidden shadow-md rounded-xl">
                            <img
                                src={coverImageBase64}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}
                
                {/* Text Content */}
                <div className="text-center mb-3 md:mb-4">
                    <p className="text-gray-600 text-xs mb-1">YIKE博客文章</p>
                    <h2 className="text-base md:text-base font-bold text-gray-800 leading-tight line-clamp-2">
                        {title}
                    </h2>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center mb-3">
                    <div className="w-20 md:w-[86px] h-20 md:h-[86px] bg-white flex items-center justify-center mb-1 rounded-xl">
                        {qrCodeUrl && (
                            <img 
                                src={qrCodeUrl} 
                                alt="QR Code" 
                                className="w-16 md:w-[74px] h-16 md:h-[74px]"
                            />
                        )}
                    </div>
                    <p className="text-gray-600 text-xs">长按扫码查看详情</p>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-0.5">
                <p className="text-gray-500 text-xs">YIKE个人博客网站提供</p>
                <p className="text-gray-400 text-[10px]">生成时间：{new Date().toLocaleString('zh-CN')}</p>
            </div>
        </div>
    )
}

export default function ShareButton({ title, url, coverImage }: ShareButtonProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [coverImageLoaded, setCoverImageLoaded] = useState(false)
    const [coverImageBase64, setCoverImageBase64] = useState<string>('')
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const generateQRCode = async () => {
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                })
                setQrCodeUrl(dataUrl)
            } catch (error) {
                console.error('Failed to generate QR code:', error)
            }
        }

        generateQRCode()
    }, [url])

    // 预加载封面图片并转换为 base64
    useEffect(() => {
        if (coverImage) {
            const loadImage = async () => {
                try {
                    const img = new Image()
                    img.crossOrigin = 'anonymous'
                    
                    img.onload = () => {
                        const canvas = document.createElement('canvas')
                        canvas.width = img.width
                        canvas.height = img.height
                        
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                            ctx.drawImage(img, 0, 0)
                            const base64 = canvas.toDataURL('image/jpeg', 0.8)
                            setCoverImageBase64(base64)
                            setCoverImageLoaded(true)
                        }
                    }

                    img.onerror = () => {
                        console.error('Failed to load image')
                        toast.error('图片加载失败')
                    }

                    img.src = `${coverImage}${coverImage.includes('?') ? '&' : '?'}t=${Date.now()}`
                } catch (error) {
                    console.error('Failed to convert image:', error)
                    toast.error('图片处理失败')
                }
            }

            loadImage()
        }
    }, [coverImage])

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url)
            toast.success('链接已复制到剪贴板')
        } catch (error) {
            console.error('Failed to copy:', error)
            toast.error('复制链接失败')
        }
    }

    const downloadImage = async () => {
        const element = cardRef.current
        if (!element || (coverImage && !coverImageLoaded)) {
            toast.error('请等待图片加载完成')
            return
        }
        
        try {
            setIsGenerating(true)
            
            // 等待下一个渲染周期，确保 isGenerating 状态已更新
            await new Promise(resolve => setTimeout(resolve, 0))

            const cardWidth = 280
            const cardHeight = 460

            // 创建一个临时的 div 来渲染卡片
            const tempDiv = document.createElement('div')
            tempDiv.style.position = 'absolute'
            tempDiv.style.left = '-9999px'
            tempDiv.style.width = `${cardWidth}px`
            tempDiv.style.height = `${cardHeight}px`
            document.body.appendChild(tempDiv)

            // 克隆卡片内容到临时 div
            const clone = element.cloneNode(true) as HTMLElement
            
            // 强制使用固定尺寸，移除所有响应式样式
            clone.style.width = `${cardWidth}px`
            clone.style.height = `${cardHeight}px`
            clone.style.padding = '24px'
            clone.style.display = 'flex'
            clone.style.flexDirection = 'column'
            clone.style.justifyContent = 'space-between'
            clone.style.background = 'linear-gradient(to bottom right, rgb(186 230 253) 0%, rgb(219 234 254) 50%, rgb(233 213 255) 100%)'
            
            // 移除所有响应式类名并设置固定样式
            const processElement = (el: HTMLElement) => {
                // 移除响应式类名
                if (el.className && typeof el.className === 'string') {
                    el.className = el.className
                        .split(' ')
                        .filter(cls => !cls.startsWith('md:') && !cls.includes('w-[') && !cls.includes('h-['))
                        .join(' ')
                }

                // 处理特定元素的样式
                // Logo 图标
                if (el.tagName === 'svg' && el.classList.contains('text-cyan-500')) {
                    el.style.width = '20px'
                    el.style.height = '20px'
                }

                // Logo 文字
                if (el.tagName === 'H1' && el.classList.contains('font-bold')) {
                    el.style.fontSize = '1.125rem'
                }

                // 文章封面图容器
                if (el.classList.contains('w-56')) {
                    el.style.width = '224px'  // 原来是 288px，缩小到 224px
                    el.style.height = '136px' // 原来是 176px，缩小到 136px
                    el.style.marginBottom = '16px'
                    el.style.borderRadius = '12px'
                }

                // 二维码容器
                if (el.classList.contains('w-20')) {
                    el.style.width = '86px'  // 原来是 112px，缩小到 86px
                    el.style.height = '86px' // 原来是 112px，缩小到 86px
                    el.style.borderRadius = '12px'
                }

                // 二维码图片
                if (el.tagName === 'IMG' && el.classList.contains('w-16')) {
                    el.style.width = '74px'   // 原来是 96px，缩小到 74px
                    el.style.height = '74px'  // 原来是 96px，缩小到 74px
                }

                // 标题容器
                if (el.classList.contains('space-y-0.5')) {
                    el.style.display = 'flex'
                    el.style.flexDirection = 'column'
                    el.style.gap = '0.125rem'
                    el.style.marginBottom = '16px'
                }

                // 标题文本
                if (el.classList.contains('text-base')) {
                    el.style.fontSize = '1rem'
                    el.style.lineHeight = '1.5rem'
                    el.style.fontWeight = '500'
                }

                // 描述文本
                if (el.classList.contains('text-xs')) {
                    el.style.fontSize = '0.75rem'
                    el.style.lineHeight = '1rem'
                    el.style.color = 'rgb(107 114 128)'
                }

                // 处理子元素
                Array.from(el.children).forEach(child => {
                    if (child instanceof HTMLElement) {
                        processElement(child)
                    }
                })
            }
            
            processElement(clone)
            tempDiv.appendChild(clone)

            try {
                // 等待一帧以确保 DOM 更新完成
                await new Promise(resolve => requestAnimationFrame(resolve))

                // 确保所有图片都已加载
                const images = Array.from(tempDiv.getElementsByTagName('img'))
                const loadPromises = images.map(img => 
                    new Promise<void>((resolve, reject) => {
                        if (img.complete) {
                            resolve()
                        } else {
                            img.onload = () => resolve()
                            img.onerror = () => reject(new Error('Failed to load image'))
                        }
                    })
                )
                await Promise.all(loadPromises)

                // 移除卡片的圆角
                const cardElement = tempDiv.firstElementChild as HTMLElement
                if (cardElement) {
                    cardElement.style.borderRadius = '0'
                }

                const result = await snapdom(tempDiv, {
                    scale: 1,
                    embedFonts: true,
                    backgroundColor: '#ffffff'
                })
                
                const fileName = title.trim().replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
                await result.download({
                    format: 'png',
                    filename: `${fileName}-分享卡片`
                })
            } finally {
                // 清理临时元素
                document.body.removeChild(tempDiv)
            }
        } catch (error) {
            console.error('Failed to generate image:', error)
            toast.error('生成图片失败')
        } finally {
            setIsGenerating(false)
        }
    }

    // 分享操作组件
    const ShareActions = () => {
        return (
            <div className="p-4 md:p-6">
                <h3 className="text-xl font-semibold mb-4">分享</h3>

                {/* 预览卡片 */}
                <div className="max-w-[300px] md:max-w-[280px] mx-auto">
                    <ShareCardContent 
                        cardRef={cardRef}
                        title={title}
                        coverImage={coverImage}
                        coverImageBase64={coverImageBase64}
                        qrCodeUrl={qrCodeUrl}
                    />
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center space-x-4 mt-6">
                    <Button
                        variant="outline"
                        className="flex-1 h-10 md:h-12 text-sm md:text-base rounded-full"
                        onClick={copyLink}
                    >
                        <Copy className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        复制链接
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-10 md:h-12 text-sm md:text-base rounded-full"
                        onClick={downloadImage}
                        disabled={isGenerating || !!(coverImage && !coverImageLoaded)}
                    >
                        <Download className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        {isGenerating ? '生成中...' : (coverImage && !coverImageLoaded ? '图片加载中...' : '保存图片')}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="group relative">
            {/* 桌面端使用 HoverCard */}
            <div className="hidden md:block">
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <Button
                            className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        >
                            <div className="flex flex-col items-center">
                                <Share2 className="w-5 h-5" />
                            </div>
                        </Button>
                    </HoverCardTrigger>
                    <HoverCardContent 
                        side="left" 
                        align="center"
                        sideOffset={16}
                        className="w-[332px] p-0"
                    >
                        <ShareActions />
                    </HoverCardContent>
                </HoverCard>
            </div>

            {/* 移动端使用 Dialog */}
            <div className="md:hidden">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        >
                            <div className="flex flex-col items-center">
                                <Share2 className="w-5 h-5" />
                            </div>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] p-0">
                        <VisuallyHidden asChild>
                            <DialogTitle>分享文章</DialogTitle>
                        </VisuallyHidden>
                        <div className="max-h-[90vh] overflow-y-auto">
                            <ShareActions />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}