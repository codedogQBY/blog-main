import { Share2, Copy, Download, Triangle } from 'lucide-react'
import { Button } from '../ui/button'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../ui/hover-card'
import { toast } from 'sonner'
import { snapdom } from '@zumer/snapdom'
import QRCode from 'qrcode'
import { useRef, useState, useEffect } from 'react'

interface ShareButtonProps {
    title: string
    url: string
    coverImage?: string
}

export default function ShareButton({ title, url, coverImage }: ShareButtonProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [coverImageLoaded, setCoverImageLoaded] = useState(false)
    const [coverImageBase64, setCoverImageBase64] = useState<string>('')
    const [isExporting, setIsExporting] = useState(false)
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
            setIsExporting(true)
            
            // 等待下一个渲染周期，确保 isExporting 状态已更新
            await new Promise(resolve => setTimeout(resolve, 0))
            
            const result = await snapdom(element, {
                scale: 2,
                embedFonts: true,
                backgroundColor: '#ffffff'
            })
            
            const fileName = title.trim().replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
            await result.download({
                format: 'png',
                filename: `${fileName}-分享卡片`
            })
        } catch (error) {
            console.error('Failed to generate image:', error)
            toast.error('生成图片失败')
        } finally {
            setIsGenerating(false)
            setIsExporting(false)
        }
    }

    return (
        <div className="group relative">
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
                    className="w-[416px] p-6"
                >
                    <h3 className="text-xl font-semibold mb-4">分享</h3>

                    {/* 分享卡片 */}
                    <div 
                        ref={cardRef} 
                        className={`w-91 h-[600px] bg-gradient-to-br from-sky-200 via-blue-100 to-purple-200 shadow-lg p-8 flex flex-col justify-between ${!isExporting ? 'rounded-3xl' : ''}`}
                    >
                        {/* YIKE Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Triangle className="w-6 h-6 text-cyan-500 fill-current rotate-90" />
                                    <Triangle className="w-6 h-6 text-cyan-500 fill-current absolute -top-0.5 -left-0.5 rotate-45" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800">YIKE</h1>
                            </div>
                        </div>

                        {/* Main Content Section */}
                        <div className="flex-1 flex flex-col items-center">
                            {/* Image */}
                            {coverImage && coverImageBase64 && (
                                <div className="mb-6">
                                    <div className={`w-72 h-44 overflow-hidden shadow-md rounded-2xl`}>
                                        <img
                                            src={coverImageBase64}
                                            alt={title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Text Content */}
                            <div className="text-center mb-6">
                                <p className="text-gray-600 text-sm mb-2">YIKE博客文章</p>
                                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                                    {title}
                                </h2>
                            </div>

                            {/* QR Code Section */}
                            <div className="flex flex-col items-center mb-4">
                                <div className={`w-28 h-28 bg-white flex items-center justify-center mb-2 rounded-2xl}`}>
                                    {qrCodeUrl && (
                                        <img 
                                            src={qrCodeUrl} 
                                            alt="QR Code" 
                                            className="w-24 h-24"
                                        />
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm">长按扫码查看详情</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center space-y-1">
                            <p className="text-gray-500 text-sm">YIKE个人博客网站提供</p>
                            <p className="text-gray-400 text-xs">生成时间：{new Date().toLocaleString('zh-CN')}</p>
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-4 mt-6">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 text-base rounded-full"
                            onClick={copyLink}
                        >
                            <Copy className="h-5 w-5 mr-2" />
                            复制链接
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 text-base rounded-full"
                            onClick={downloadImage}
                            disabled={isGenerating || (coverImage && !coverImageLoaded)}
                        >
                            <Download className="h-5 w-5 mr-2" />
                            {isGenerating ? '生成中...' : (coverImage && !coverImageLoaded ? '图片加载中...' : '保存图片')}
                        </Button>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    )
}