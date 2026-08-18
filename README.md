# Atlas of Time (`atlas-of-fime`)

An open-source, interactive timeline platform exploring 13.8 billion years of Earth, Humanity, and Civilization through a logarithmic chronological spine, real-world spatial map, and grounded AI historian navigation.

---

## 🌟 Key Features & Architecture

- **Logarithmic Chronological Spine:** Seamlessly visualizes cosmic time (Big Bang ~13.8B BP) down to the modern era on a single continuous, non-linear timeline.
- **Time Machine Scrubber Wheel:** Tactile continuous time scrubber for effortless time-travel across millennia with real-time map locus fly-to and era highlighting.
- **Real-World Spatial Atlas:** MapLibre GL JS vector & raster integration with historical boundary snapshot overlays.
- **Grounded AI Historian:** Retrieval-augmented navigation over Supabase database records using OpenAI `gpt-4o-mini` with clickable entity citations.
- **Editorial CMS & Role-Based Security:** Multistage editorial workflow (`Draft ➔ Review ➔ Approved ➔ Published`) enforced by Supabase Row Level Security (RLS) policies.

---

## 🗄️ Database Setup & Supabase DDL Schema

This repository includes a complete, self-contained, open-source Supabase DDL SQL schema file: **[`supabase/schema.sql`](supabase/schema.sql)**.

To set up your own database backend:

1. Create a free project at [Supabase.com](https://supabase.com/).
2. Navigate to **SQL Editor** in your Supabase Dashboard.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. This instantly provisions:
   - All 11 core production tables (`events`, `event_dates`, `event_locations`, `people`, `civilizations`, `relationships`, `sources`, `profiles`, `layers`, `event_layers`, `event_sources`).
   - Postgres Full-Text Search (`fts` generated columns & GIN indexes).
   - Row Level Security (RLS) policies for Viewer, Editor, and Admin role isolation.
   - Automatic `on_auth_user_created` trigger for user profile management.

---

## 🔒 Security & Environment Setup

This repository contains **zero hardcoded API keys, private credentials, or sensitive user information**. All environment-specific parameters are loaded via environment variables.

### Environment Setup

1. Copy `.env.example` to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Configure your keys in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
   VITE_OPENAI_API_KEY=your-openai-api-key-here
   ```

*(Note: `.env` is listed in `.gitignore` and is never committed to Git.)*

---

## 🚀 Local Development Quickstart

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhishekkumar74/atlas-of-fime.git
   cd atlas-of-fime
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🧪 Testing & Quality Assurance

- **Run Automated Unit & Integration Tests (58 Tests across 17 Files):**
  ```bash
  npm run test
  ```
- **TypeScript Type Checking:**
  ```bash
  npm run typecheck
  ```
- **ESLint Code Quality Audit:**
  ```bash
  npm run lint
  ```
- **Production Build:**
  ```bash
  npm run build
  ```

---

## 📄 License

Open-source under the MIT License.
