import { NextRequest } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Path to yt-dlp executable
const YT_DLP_PATH = path.join(process.cwd(), 'yt-dlp.exe')

// Check if running on serverless (Vercel)
function isServerless(): boolean {
    return process.env.VERCEL === '1' || !fs.existsSync(YT_DLP_PATH)
}

export async function GET(request: NextRequest) {
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

    // Check if we're on Vercel (no yt-dlp available)
    if (isServerless()) {
        return new Response(
            JSON.stringify({
                error: 'High quality downloads not available on this server',
                reason: 'This feature requires yt-dlp which is not available on serverless platforms.',
                hint: 'For full quality selection, run this app locally with yt-dlp installed.'
            }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
    }

    console.log(`Processing - Format: ${format}, Quality: ${quality}`)

    // Create temp file path
    const tempDir = os.tmpdir()
    const tempFile = path.join(tempDir, `yt-download-${Date.now()}`)

    try {
        // Build yt-dlp command for downloading
        let formatSelector: string
        let outputExt: string

        if (format === 'mp3') {
            formatSelector = 'bestaudio[ext=m4a]/bestaudio'
            outputExt = 'mp3'
        } else {
            // For MP4, select best combined format at or below target quality
            const targetQuality = parseInt(quality)
            formatSelector = `best[height<=${targetQuality}][ext=mp4]/best[height<=${targetQuality}]/best[ext=mp4]/best`
            outputExt = 'mp4'
        }

        const outputPath = `${tempFile}.${outputExt}`

        console.log(`Downloading with yt-dlp to: ${outputPath}`)
        console.log(`Format selector: ${formatSelector}`)

        // Run yt-dlp to download
        await new Promise<void>((resolve, reject) => {
            const args = [
                '-f', formatSelector,
                '-o', outputPath,
                '--no-warnings',
                '--no-playlist',
                url
            ]

            if (format === 'mp3') {
                args.push('-x', '--audio-format', 'mp3')
            }

            console.log(`Executing: yt-dlp ${args.join(' ')}`)

            const ytdlp = spawn(YT_DLP_PATH, args)

            let stderr = ''

            ytdlp.stdout.on('data', (data) => {
                console.log(`yt-dlp: ${data}`)
            })

            ytdlp.stderr.on('data', (data) => {
                stderr += data.toString()
                console.error(`yt-dlp stderr: ${data}`)
            })

            ytdlp.on('close', (code) => {
                if (code === 0) {
                    resolve()
                } else {
                    reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`))
                }
            })

            ytdlp.on('error', (err) => {
                reject(err)
            })
        })

        // Check if file exists and get its size
        const finalPath = format === 'mp3' ? `${tempFile}.mp3` : outputPath

        // yt-dlp might save with different name, find the file
        let actualFile = finalPath
        if (!fs.existsSync(finalPath)) {
            // Try to find file with similar name
            const files = fs.readdirSync(tempDir).filter(f => f.startsWith(`yt-download-${Date.now().toString().slice(0, -3)}`))
            if (files.length > 0) {
                actualFile = path.join(tempDir, files[0])
            } else {
                throw new Error('Downloaded file not found')
            }
        }

        const stats = fs.statSync(actualFile)
        console.log(`✅ Downloaded: ${actualFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)

        // Read file and stream it
        const fileBuffer = fs.readFileSync(actualFile)

        // Clean up temp file
        try {
            fs.unlinkSync(actualFile)
        } catch (e) {
            // Ignore cleanup errors
        }

        // Extract filename from path
        const filename = path.basename(actualFile)

        // Return the file with proper headers
        const headers = new Headers({
            'Content-Type': format === 'mp3' ? 'audio/mpeg' : 'video/mp4',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': stats.size.toString(),
        })

        return new Response(fileBuffer, { headers })

    } catch (error: any) {
        console.error('Download error:', error.message)

        // Clean up temp files on error
        try {
            const files = fs.readdirSync(tempDir).filter(f => f.startsWith('yt-download-'))
            files.forEach(f => {
                try { fs.unlinkSync(path.join(tempDir, f)) } catch (e) { }
            })
        } catch (e) { }

        return new Response(
            JSON.stringify({
                error: error.message || 'Download failed',
                hint: 'Make sure yt-dlp.exe exists and the video is available.'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
