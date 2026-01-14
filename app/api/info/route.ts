import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const url = searchParams.get('url')

        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            )
        }

        // Extract video ID from YouTube URL
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        if (!videoIdMatch) {
            return NextResponse.json(
                { error: 'Invalid YouTube URL' },
                { status: 400 }
            )
        }

        const videoId = videoIdMatch[1]

        // Use YouTube oEmbed API (no library needed, no warnings)
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

        const oembedResponse = await fetch(oembedUrl)

        if (!oembedResponse.ok) {
            throw new Error('Video not found or unavailable')
        }

        const oembedData = await oembedResponse.json()

        // Format duration - get from noembed.com for duration
        let duration = '0:00'
        try {
            const noembedResponse = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
            if (noembedResponse.ok) {
                // noembed doesn't have duration, so we'll show N/A
                duration = 'N/A'
            }
        } catch {
            duration = 'N/A'
        }

        const videoInfo = {
            title: oembedData.title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: duration,
            author: oembedData.author_name,
        }

        return NextResponse.json(videoInfo)
    } catch (error: any) {
        console.error('Error fetching video info:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch video information' },
            { status: 500 }
        )
    }
}
