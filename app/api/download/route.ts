import { NextRequest } from 'next/server'
import ytdl from '@distube/ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import { Readable, PassThrough } from 'stream'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const url = searchParams.get('url')
        const format = searchParams.get('format') || 'mp3'
        const quality = searchParams.get('quality') || '720'

        if (!url) {
            return new Response(
                JSON.stringify({ error: 'URL parameter is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        if (!ytdl.validateURL(url)) {
            return new Response(
                JSON.stringify({ error: 'Invalid YouTube URL' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Options to bypass YouTube 403 errors
        const ytdlOptions = {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Sec-Fetch-Mode': 'navigate',
                }
            }
        }

        // Get video info for filename
        const info = await ytdl.getInfo(url, ytdlOptions)
        const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()

        if (format === 'mp3') {
            // Audio only download
            const audioStream = ytdl(url, {
                quality: 'highestaudio',
                filter: 'audioonly',
                ...ytdlOptions
            })

            // Convert to MP3 using FFmpeg
            const convertedStream = await convertToMP3(audioStream)

            const headers = new Headers({
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename="${title}.mp3"`,
            })

            // Return the stream as response
            return new Response(convertedStream as any, { headers })
        } else if (format === 'mp4') {
            // For MP4, try to get a format that already has video+audio
            // This is simpler than merging separate streams
            const targetQuality = parseInt(quality)

            // Check if formats are available
            const formats = info.formats.filter((fmt) =>
                fmt.hasVideo && fmt.hasAudio && (fmt.height || 0) <= targetQuality
            )

            if (formats.length === 0) {
                throw new Error('No suitable video format found. YouTube may have blocked this video or the quality is not available.')
            }

            // Get format with both video and audio (most common for lower qualities)
            const videoStream = ytdl(url, {
                quality: 'highest',
                filter: (fmt) => {
                    return fmt.hasVideo && fmt.hasAudio &&
                        (fmt.height || 0) <= targetQuality
                },
                ...ytdlOptions
            })

            // Add error handling for the stream
            let streamError: Error | null = null
            videoStream.on('error', (err) => {
                console.error('Video stream error:', err)
                streamError = err
            })

            // Wait a bit to see if stream initialization fails
            await new Promise(resolve => setTimeout(resolve, 500))

            if (streamError) {
                throw new Error('Failed to initialize video stream. YouTube may have blocked the download.')
            }

            const headers = new Headers({
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${title}.mp4"`,
            })

            // Return the stream directly (already in MP4 format)
            return new Response(videoStream as any, { headers })
        } else {
            return new Response(
                JSON.stringify({ error: 'Invalid format. Use mp3 or mp4' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }
    } catch (error: any) {
        console.error('Download error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Download failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}

// Helper function to convert audio stream to MP3
function convertToMP3(inputStream: Readable): Promise<Readable> {
    return new Promise((resolve, reject) => {
        const outputStream = new PassThrough()

        ffmpeg(inputStream)
            .toFormat('mp3')
            .audioBitrate(128)
            .on('error', (err) => {
                console.error('FFmpeg error:', err)
                reject(err)
            })
            .on('end', () => {
                console.log('MP3 conversion completed')
            })
            .pipe(outputStream, { end: true })

        // Resolve immediately with the output stream
        resolve(outputStream)
    })
}
