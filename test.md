# 🎥 Technical Docs: Next.js YouTube Downloader

Dokumen ini berisi spesifikasi teknis, kebutuhan sistem, dan alur kerja untuk aplikasi YouTube Downloader berbasis Next.js (Monorepo).

---

## 1. Project Overview
Aplikasi web sederhana untuk mengunduh video YouTube dan mengonversinya secara otomatis menjadi format Audio (MP3) atau Video (MP4).

* **Type:** Monorepo (Frontend & Backend dalam satu project Next.js).
* **Core Logic:** Menggunakan `API Routes` Next.js untuk streaming dan transcoding.

---

## 2. System Requirements (Wajib)
Sebelum menjalankan aplikasi, lingkungan server/lokal **HARUS** memiliki:

1.  **Node.js** (v18.0.0+)
    * Runtime utama aplikasi.
2.  **FFmpeg Binary** ⚠️ *(CRITICAL)*
    * Software command-line untuk pemrosesan media.
    * **Wajib terinstall di OS**, bukan hanya di `npm`.
    * *Check:* Jalankan `ffmpeg -version` di terminal. Jika error, aplikasi tidak akan jalan.
3.  **Internet Connection** (Server-side)
    * Server membutuhkan bandwidth yang cukup untuk menarik data dari YouTube.

---

## 3. Tech Stack

### Dependencies (NPM)
Library berikut harus diinstall di `package.json`:

| Package | Deskripsi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **`next`** | Framework React | Mendukung Fullstack (UI + API). |
| **`@distube/ytdl-core`** | YouTube Downloader | Fork dari `ytdl-core` yang lebih aktif diupdate & stabil. |
| **`fluent-ffmpeg`** | FFmpeg Wrapper | Jembatan komunikasi Node.js ke software FFmpeg. |
| **`lucide-react`** | Icon Library | Untuk UI yang lebih informatif (opsional). |
| **`clsx` / `tailwind-merge`** | Utility | Helper styling CSS (opsional). |

### Command Install
```bash
npm install next react react-dom @distube/ytdl-core fluent-ffmpeg