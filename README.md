# 🎥 YouTube Downloader - Next.js

A modern, premium web application to download YouTube videos as **MP3** (audio) or **MP4** (video) with quality selection.

## ✨ Features

- 🎵 **MP3 Download** - Extract audio only
- 🎬 **MP4 Download** - Download video with quality selection (144p to 1080p)
- 🚀 **Streaming** - No files saved on server (direct streaming to browser)
- 💎 **Premium UI** - Modern design with glassmorphism and animations
- ⚡ **Real-time Conversion** - Uses FFmpeg for on-the-fly transcoding
- 📱 **Responsive** - Works on desktop and mobile

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@distube/ytdl-core** - YouTube downloader
- **fluent-ffmpeg** - FFmpeg wrapper for conversion
- **lucide-react** - Icons

## ⚠️ CRITICAL REQUIREMENT

**FFmpeg must be installed on your system!** This application will NOT work without FFmpeg.

### Check if FFmpeg is installed:
```bash
ffmpeg -version
```

If you see an error, **you need to install FFmpeg first**. See [FFMPEG_INSTALL_GUIDE.md](./FFMPEG_INSTALL_GUIDE.md) for detailed instructions.

## 🚀 Quick Start

### 1. Install FFmpeg

**Windows (using Chocolatey):**
```powershell
choco install ffmpeg
```

**See [FFMPEG_INSTALL_GUIDE.md](./FFMPEG_INSTALL_GUIDE.md) for other installation methods.**

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

1. **Enter YouTube URL** - Paste any valid YouTube video URL
2. **Select Format** - Choose MP3 (audio only) or MP4 (video)
3. **Choose Quality** - For MP4, select resolution (144p - 1080p)
4. **Get Video Info** - Click to load video details
5. **Download** - Click the download button to start

## 🏗️ Project Structure

```
youtube-downloader/
├── app/
│   ├── api/
│   │   ├── download/
│   │   │   └── route.ts      # Download API with streaming
│   │   └── info/
│   │       └── route.ts      # Video info API
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── public/                   # Static files
├── FFMPEG_INSTALL_GUIDE.md  # FFmpeg installation guide
├── next.config.js           # Next.js config
├── tailwind.config.js       # Tailwind config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## 🔧 API Routes

### GET `/api/info`

Fetch video information.

**Query Parameters:**
- `url` (required) - YouTube video URL

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": "3:45",
  "author": "Channel Name"
}
```

### GET `/api/download`

Download and convert video.

**Query Parameters:**
- `url` (required) - YouTube video URL
- `format` (required) - `mp3` or `mp4`
- `quality` (optional) - `144`, `360`, `480`, `720`, `1080` (for MP4 only, default: `720`)

**Returns:** Streaming file download

## 🎨 UI Design

The application features a **premium, modern design** with:
- Animated gradient background
- Glassmorphism effects
- Smooth transitions
- Loading states
- Error handling with user-friendly messages
- Responsive layout

## 📝 How It Works

### User Flow:

1. **Input** → User enters YouTube URL and selects format/quality
2. **Request** → Browser sends GET request to `/api/info` for video details
3. **Fetch Info** → Backend validates URL and fetches video metadata
4. **Display** → Frontend shows video title, thumbnail, duration
5. **Download** → User clicks download
6. **Streaming** → Backend:
   - Creates ReadStream from YouTube
   - Pipes through FFmpeg for conversion
   - Streams directly to browser (no disk storage)
7. **Complete** → Browser receives and downloads converted file

### Technical Flow:

```
YouTube → ytdl-core → FFmpeg → Browser
          (stream)    (convert) (download)
```

## 🔒 Important Notes

- ⚠️ **Legal**: Downloading copyrighted content may violate YouTube's ToS
- 🎓 **Purpose**: This project is for educational purposes only
- 💾 **Storage**: No files are saved on the server (streaming only)
- 🌐 **Server**: The server needs good internet bandwidth

## 🐛 Troubleshooting

### FFmpeg not found
- Make sure FFmpeg is installed: `ffmpeg -version`
- Restart your terminal after installation
- Check PATH environment variable

### Download fails
- Verify the YouTube URL is valid
- Check if the video is public (not private/deleted)
- Some videos may be restricted or age-gated

### Slow downloads
- Video quality affects download time
- Server internet speed matters
- Try lower quality for faster downloads

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🤝 Contributing

Feel free to fork and improve this project!

## 📄 License

This project is for educational purposes only.

---

Made with ❤️ using Next.js
