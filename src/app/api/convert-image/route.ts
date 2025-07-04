import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
        return new NextResponse('Missing image URL', { status: 400 })
    }

    try {
        const response = await fetch(imageUrl)
        const buffer = await response.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const mimeType = response.headers.get('content-type') || 'image/jpeg'
        const dataUrl = `data:${mimeType};base64,${base64}`

        return new NextResponse(JSON.stringify({ dataUrl }), {
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        console.error('Failed to convert image:', error)
        return new NextResponse('Failed to convert image', { status: 500 })
    }
} 