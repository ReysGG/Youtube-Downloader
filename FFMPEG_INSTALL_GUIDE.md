# ⚠️ CRITICAL: FFmpeg Installation Required

## FFmpeg Not Found

FFmpeg is **NOT INSTALLED** on your system. This is a **CRITICAL DEPENDENCY** for the YouTube Downloader to work.

Without FFmpeg, the application **WILL NOT** be able to convert video/audio files.

---

## How to Install FFmpeg on Windows

### Option 1: Using Chocolatey (Recommended)

1. **Install Chocolatey** (if not already installed):
   - Open PowerShell as Administrator
   - Run:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install FFmpeg**:
   ```powershell
   choco install ffmpeg
   ```

3. **Verify Installation**:
   ```powershell
   ffmpeg -version
   ```

### Option 2: Manual Installation

1. **Download FFmpeg**:
   - Visit: https://www.gyan.dev/ffmpeg/builds/
   - Download: `ffmpeg-release-essentials.zip`

2. **Extract and Setup**:
   - Extract the ZIP file to `C:\ffmpeg`
   - Add `C:\ffmpeg\bin` to your System PATH:
     - Right-click "This PC" → Properties
     - Advanced System Settings → Environment Variables
     - Under "System variables", find "Path"
     - Click "Edit" → "New"
     - Add: `C:\ffmpeg\bin`
     - Click OK on all dialogs

3. **Restart Terminal and Verify**:
   - Open a new PowerShell/CMD window
   - Run:
   ```powershell
   ffmpeg -version
   ```

### Option 3: Using Scoop

1. **Install Scoop** (if not already installed):
   ```powershell
   iwr -useb get.scoop.sh | iex
   ```

2. **Install FFmpeg**:
   ```powershell
   scoop install ffmpeg
   ```

3. **Verify**:
   ```powershell
   ffmpeg -version
   ```

---

## After Installing FFmpeg

Once FFmpeg is installed successfully, you can start the development server:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## Troubleshooting

**If `ffmpeg -version` still shows "command not found" after installation:**

1. Make sure you've **closed and reopened** your terminal
2. Verify FFmpeg is in your PATH:
   ```powershell
   $env:Path -split ';' | Select-String ffmpeg
   ```
3. Try running with full path:
   ```powershell
   C:\ffmpeg\bin\ffmpeg.exe -version
   ```

**Need Help?**
- FFmpeg Official Site: https://ffmpeg.org/
- FFmpeg Windows Builds: https://www.gyan.dev/ffmpeg/builds/
