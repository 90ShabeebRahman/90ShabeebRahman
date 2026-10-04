# MUSIQ — Modern Full-Stack YouTube-Powered Music Platform

**MUSIQ** is a modern, high-performance web application for discovering and listening to music through legitimate **YouTube-powered playback**. Designed with an original dark-mode aesthetic, MUSIQ offers a Spotify-like user experience powered entirely by YouTube's official developer APIs and embedded player infrastructure.

---

## 🌟 Key Features

- **YouTube-Powered Playback**: Continuous audio/video playback using YouTube's official IFrame Player API.
- **Persistent Player Bar**: Music continues playing seamlessly while navigating across pages (Home, Search, Playlists, Artist pages, etc.).
- **Smart Search & Discovery**: Real-time debounced YouTube Data API search across songs, videos, and channels with category filtering and search history.
- **Queue Management**: Real-time queue supporting track reordering, Play Next, Add to Queue, and intelligent Shuffle (prevents immediate repeats) and Repeat modes (Off, All, One).
- **Playlists & Library**: Authenticated users can create, edit, reorder, share, and delete personal playlists.
- **Liked Songs & History**: Track favorite songs and view detailed listening history with automatic database recording.
- **Artist & Song Detail Pages**: Channel/Artist overviews with top tracks and shareable track URLs (`/song/:videoId`, `/artist/:channelId`, `/playlist/:id`).
- **User Accounts & Authentication**: Secure JWT authentication with bcrypt password hashing and user profile customization.
- **PWA Ready**: Web App Manifest and SVG logo setup for installation as a Progressive Web App.
- **100% Legal & Compliant**: Uses YouTube's official permitted playback mechanisms—does **NOT** download, extract, rip, MP3-convert, or re-host copyrighted YouTube media.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Icons**: Lucide React

### Backend
- **Server**: Node.js & Express with TypeScript
- **Database**: SQLite (via `better-sqlite3`) / PostgreSQL compatible
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Services Layer**: YouTube Data API v3 service abstraction with caching and graceful fallbacks

---

## 📁 Repository Structure

```text
musiq/
├── backend/
│   ├── src/
│   │   ├── controllers/       # REST API endpoint handlers
│   │   ├── database/          # Database connection & schema initializations
│   │   ├── middleware/        # JWT auth verification
│   │   ├── routes/            # Express router modules
│   │   ├── services/
│   │   │   └── youtube/       # Isolated YouTube Data API v3 abstraction
│   │   ├── utils/             # Helper utilities
│   │   ├── api.test.ts        # Integration test suite
│   │   └── server.ts          # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # PlayerBar, QueueDrawer, Sidebar, Header, etc.
│   │   ├── layouts/           # MainLayout persistent frame
│   │   ├── pages/             # Home, Search, Library, Playlists, Profile, Auth
│   │   ├── services/          # API HTTP client
│   │   ├── stores/            # Zustand player & auth state
│   │   ├── styles/            # Tailwind styles
│   │   ├── types/             # TypeScript interfaces
│   │   └── App.tsx            # App router setup
│   └── package.json
│
├── public/                    # Manifest.json & branding assets
├── .env.example               # Environment variables template
├── package.json               # Root monorepo workspace configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. (Optional) Configure your official **YouTube Data API v3 key** in `.env`:
   ```env
   YOUTUBE_API_KEY=your_actual_youtube_api_key
   JWT_SECRET=your_custom_jwt_secret
   DATABASE_URL=sqlite:./musiq.db
   ```
   *Note: If no YouTube API key is provided, MUSIQ gracefully falls back to structured featured search results so you can test the full platform immediately.*

### Installation & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Servers** (Runs backend on `:5000` and frontend on `:3000`):
   ```bash
   # Terminal 1: Backend
   npm --prefix backend run dev

   # Terminal 2: Frontend
   npm --prefix frontend run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

---

## 🧪 Testing

### Backend Unit & Integration Tests
Runs the Vitest test suite covering Authentication, YouTube API Abstraction, Playlists, Likes, and History APIs:
```bash
npm --prefix backend run test
```

### Frontend Production Build Test
Verify TypeScript compilation and Vite production bundle generation:
```bash
npm --prefix frontend run build
```

---

## 🔑 How to Obtain a YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `MUSIQ`.
3. Navigate to **APIs & Services > Library**.
4. Search for **YouTube Data API v3** and click **Enable**.
5. Go to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
6. Copy the generated API key and paste it into your `.env` file under `YOUTUBE_API_KEY`.

---

## 🌐 Production Deployment Guidelines

1. **Build Assets**:
   ```bash
   npm run build
   ```
2. **Database**: In production, pass a PostgreSQL URL in `DATABASE_URL` or use persistent storage volume for the SQLite database (`musiq.db`).
3. **Run Server**:
   ```bash
   NODE_ENV=production PORT=5000 node backend/dist/server.js
   ```

---

## ⚖️ Legal & Compliance Disclaimer

MUSIQ strictly complies with YouTube Developer Policies and API Terms of Service. It operates as a discovery and playback interface leveraging YouTube's official embedded player. It does not extract audio streams, store copyrighted media files, bypass ads, or re-host YouTube media.
