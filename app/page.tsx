'use client'

import { useState } from 'react'
import { Download, Loader2, Video, Music, AlertCircle, CheckCircle2 } from 'lucide-react'

interface VideoInfo {
    title: string
    thumbnail: string
    duration: string
    author: string
}

export default function Home() {
    const [url, setUrl] = useState('')
    const [format, setFormat] = useState<'mp3' | 'mp4'>('mp3')
    const [quality, setQuality] = useState('720')
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const validateYouTubeUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
        return youtubeRegex.test(url)
    }

    const getVideoInfo = async () => {
        setError('')
        setSuccess('')
        setVideoInfo(null)

        if (!url.trim()) {
            setError('Please enter a YouTube URL')
            return
        }

        if (!validateYouTubeUrl(url)) {
            setError('Invalid YouTube URL format')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch video info')
            }

            setVideoInfo(data)
            setSuccess('Video info loaded successfully!')
        } catch (err: any) {
            setError(err.message || 'Failed to fetch video information')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!videoInfo) {
            setError('Please get video info first')
            return
        }

        setDownloading(true)
        setError('')
        setSuccess('')

        try {
            const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format=${format}&quality=${quality}`

            const response = await fetch(downloadUrl)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Download failed')
            }

            const blob = await response.blob()

            // Validate that blob actually contains data
            if (blob.size < 10000) {
                throw new Error('Download failed: File is empty or corrupted.')
            }

            // Get filename from Content-Disposition header or create one
            const contentDisposition = response.headers.get('Content-Disposition')
            let filename = `${videoInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${quality}p.${format === 'mp3' ? 'mp3' : 'mp4'}`

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/)
                if (match) {
                    filename = match[1]
                }
            }

            const downloadLink = document.createElement('a')
            const objectUrl = URL.createObjectURL(blob)

            downloadLink.href = objectUrl
            downloadLink.download = filename
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
            URL.revokeObjectURL(objectUrl)

            setSuccess(`Downloaded successfully! (${(blob.size / 1024 / 1024).toFixed(2)} MB)`)
        } catch (err: any) {
            setError(err.message || 'Download failed')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <main className="min-h-screen gradient-bg p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 pt-8">
                    <div className="inline-block mb-4">
                        <Video className="w-16 h-16 text-white animate-float" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        YouTube Downloader
                    </h1>
                    <p className="text-xl text-white/80">
                        Download your favorite videos as MP3 or MP4
                    </p>
                </div>

                {/* Main Card */}
                <div className="glass rounded-3xl p-8 shadow-2xl">
                    {/* URL Input */}
                    <div className="mb-6">
                        <label className="block text-white font-semibold mb-2">
                            YouTube URL
                        </label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                    </div>

                    {/* Format Selection */}
                    <div className="mb-6">
                        <label className="block text-white font-semibold mb-3">
                            Select Format
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setFormat('mp3')}
                                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all ${format === 'mp3'
                                    ? 'bg-white text-purple-600 shadow-lg scale-105'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <Music className="w-5 h-5" />
                                MP3 (Audio)
                            </button>
                            <button
                                onClick={() => setFormat('mp4')}
                                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all ${format === 'mp4'
                                    ? 'bg-white text-purple-600 shadow-lg scale-105'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <Video className="w-5 h-5" />
                                MP4 (Video)
                            </button>
                        </div>
                    </div>

                    {/* Quality Selection (only for MP4) */}
                    {format === 'mp4' && (
                        <div className="mb-6">
                            <label className="block text-white font-semibold mb-2">
                                Video Quality
                            </label>
                            <select
                                value={quality}
                                onChange={(e) => setQuality(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            >
                                <option value="144" className="bg-gray-800">144p (Low)</option>
                                <option value="360" className="bg-gray-800">360p (Medium)</option>
                                <option value="480" className="bg-gray-800">480p (Good)</option>
                                <option value="720" className="bg-gray-800">720p (HD)</option>
                                <option value="1080" className="bg-gray-800">1080p (Full HD)</option>
                            </select>
                        </div>
                    )}

                    {/* Get Info Button */}
                    <button
                        onClick={getVideoInfo}
                        disabled={loading}
                        className="w-full bg-white text-purple-600 py-4 rounded-xl font-bold text-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-6 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading Video Info...
                            </>
                        ) : (
                            'Get Video Info'
                        )}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                            <p className="text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                            <p className="text-green-200">{success}</p>
                        </div>
                    )}

                    {/* Video Info Display */}
                    {videoInfo && (
                        <div className="mb-6 p-6 bg-white/10 rounded-xl border border-white/20">
                            <div className="flex gap-4">
                                <img
                                    src={videoInfo.thumbnail}
                                    alt={videoInfo.title}
                                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-lg mb-2">
                                        {videoInfo.title}
                                    </h3>
                                    <p className="text-white/70 text-sm mb-1">
                                        By {videoInfo.author}
                                    </p>
                                    <p className="text-white/70 text-sm">
                                        Duration: {videoInfo.duration}
                                    </p>
                                </div>
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Download {format.toUpperCase()}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-white/60 text-sm">
                    <p>⚠️ Make sure you have permission to download the content</p>
                    <p className="mt-2">For educational purposes only</p>
                </div>
            </div>
        </main>
    )
}
