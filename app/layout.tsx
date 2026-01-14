import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'YouTube Downloader - Download MP3 & MP4',
    description: 'Download YouTube videos as MP3 (audio) or MP4 (video) with quality selection',
    keywords: ['youtube', 'downloader', 'mp3', 'mp4', 'converter', 'video', 'audio'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased">
                {children}
            </body>
        </html>
    )
}
