import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

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

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return NextResponse.json(
                { error: 'Invalid YouTube URL' },
                { status: 400 }
            )
        }

        // Get video info with headers to bypass YouTube 403 errors
        const info = await ytdl.getInfo(url, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                }
            }
        })

        // Format duration from seconds to MM:SS
        const formatDuration = (seconds: number): string => {
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            return `${mins}:${secs.toString().padStart(2, '0')}`
        }

        const videoInfo = {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            duration: formatDuration(parseInt(info.videoDetails.lengthSeconds)),
            author: info.videoDetails.author.name,
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
