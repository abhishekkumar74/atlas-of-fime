# Atlas of Time (`atlas-of-fime`)

An open-source, developer-friendly multi-package platform exploring 13.8 billion years of Earth, Humanity, and Civilization through a logarithmic chronological spine, real-world spatial map, and AI historian navigation.

---

## 📁 Repository Architecture

The project is structured into a clean multi-package layout:

```
atlas-of-fime/
├── client/              # Frontend (React 18, Vite, TailwindCSS, MapLibre, Zustand)
│   ├── src/             # Application UI components, pages, hooks, and tests
│   ├── public/          # Static assets and icons
│   └── package.json     # Frontend dependencies and scripts
│
├── server/              # Backend (Node.js, Express API server, Supabase/OpenAI handlers)
│   ├── src/             # Express controllers & API endpoints (/api/events, /api/search)
│   └── package.json     # Backend API dependencies
│
├── vercel.json          # Unified 1-Click Vercel Deployment Configuration
├── package.json         # Workspace root scripts
└── README.md            # Documentation
```

---

## 🌐 1-Click Vercel Production Deployment (Client & Server Together)

This repository includes a unified **[`vercel.json`](vercel.json)** configuration file. You can deploy **BOTH the frontend React client AND the Node/Express backend server together in a single Vercel project**:

1. Go to **[Vercel.com](https://vercel.com/)** and import repository: **`abhishekkumar74/atlas-of-fime`**.
2. Keep **Root Directory** as **`./`** (default root repository).
3. Set **Environment Variables**:
   - `VITE_SUPABASE_URL` = `https://mhskjcvtfoplcqrihnqq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = *(your anon key)*
   - `SUPABASE_SERVICE_ROLE_KEY` = *(your service role key)*
   - `VITE_OPENAI_API_KEY` = *(your openai key)*
4. Click **Deploy**.
   - Vercel automatically builds the React SPA and deploys the Express server endpoints (`/api/*`) in 1 click!

---

## ✨ Features & Functionality

### 🌌 Logarithmic Chronological Timeline
- Visualizes 13.8 billion years of cosmic and human history on a single continuous horizontal timeline.
- Logarithmic scaling balances deep cosmic time (Big Bang, formation of Earth, evolutionary biology) alongside dense historical eras (ancient empires, industrial revolution, modern age).

### ⏳ Time Machine Scrubber Wheel
- Tactile, continuous mechanical time wheel for intuitive time-travel across millennia.
- Dragging or wheel-scrolling on the scrubber continuously tunes the era, centers the timeline, flies the spatial map to geographic loci, and highlights active events.

### 🗺️ Real-World Spatial Atlas
- Interactive vector map powered by MapLibre GL JS.
- Synchronizes with timeline events to display spatial marker loci and historical territory boundary snapshot overlays.

### 📌 Non-Intrusive Active Event Dashboard
- Highlights tuned historical events on a sleek bottom dashboard card showing title, formatted date, primary region, and summary.
- Clicking *"View Full Details ➔"* opens the comprehensive side detail panel.

### 🤖 Grounded AI Historian Navigation
- AI assistant providing concise answers strictly grounded in active historical database records.
- Generates responses with interactive, clickable entity citation chips.

### 🛡️ Editorial CMS & Multi-Stage Approval Workflow
- Role-based administration dashboard (`Viewer`, `Editor`, `Super Admin`).
- Complete editorial lifecycle governance (`Draft ➔ Review ➔ Approved ➔ Published`) ensuring academic sourcing and fact-checking prior to public release.

---

## 🚀 Quickstart & Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run automated test suite
npm run test

# Run TypeScript type checking
npm run typecheck

# Run ESLint check
npm run lint

# Build for production
npm run build
```
