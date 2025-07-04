import { Share2, Copy, Download } from 'lucide-react'
import { Button } from '../ui/button'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../ui/hover-card'
import { toast } from 'sonner'
import { snapdom } from '@zumer/snapdom'
import QRCode from 'qrcode'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'

interface ShareButtonProps {
    title: string
    url: string
    coverImage?: string
}

export default function ShareButton({ title, url, coverImage }: ShareButtonProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
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
        if (!element) return
        
        try {
            setIsGenerating(true)
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
                        className="bg-gradient-to-b from-[#E1F0FF] to-[#F5E6FF] rounded-3xl overflow-hidden"
                    >
                        {/* 内容区域 */}
                        <div className="p-8">
                            <div className="flex gap-6">
                                {/* 封面图 */}
                                {coverImage && (
                                    <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={coverImage}
                                                alt={title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 文章信息 */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-gray-600 mb-2">YIKE博客文章</div>
                                    <h2 className="text-xl font-bold line-clamp-3">{title}</h2>
                                </div>
                            </div>
                        </div>

                        {/* 二维码区域 */}
                        <div className="bg-white/80 backdrop-blur-sm p-8 flex flex-col items-center">
                            <div className="bg-white w-32 h-32 rounded-2xl p-2 shadow-sm mb-3">
                                {qrCodeUrl && (
                                    <img 
                                        src={qrCodeUrl} 
                                        alt="QR Code" 
                                        className="w-full h-full"
                                    />
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mb-4">长按扫码查看详情</p>
                            <div className="text-center space-y-1">
                                <p className="text-gray-500 text-sm">YIKE个人博客网站提供</p>
                                <p className="text-gray-400 text-xs">生成时间：{new Date().toLocaleString('zh-CN')}</p>
                            </div>
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
                            disabled={isGenerating}
                        >
                            <Download className="h-5 w-5 mr-2" />
                            保存图片
                        </Button>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    )
} 