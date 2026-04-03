# RewardSystem — MindX

> Hệ thống tích điểm đổi quà cho học viên MindX — Track achievement, earn points, redeem rewards.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Auth + Database | Supabase |
| Package Manager | npm |

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/hieu1966hn/reward-system.git
cd reward-system
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Database (Supabase)

Run the migration in **Supabase SQL Editor**:

```bash
# Copy and paste contents of:
supabase/migrations/001_initial_schema.sql
```

This will create:
- `campuses` table + seed data (6 MindX campuses)
- `profiles` table (synced from auth.users via trigger)
- RLS policies

### 4. Create Test Users

In Supabase Dashboard → **Authentication → Users → Add user**:
- Create at least 1 user for testing
- Set role manually in `profiles` table if needed (default: `student`)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development Roadmap

| Round | Feature | Status |
|---|---|---|
| **Vòng 1** | App Shell + Auth Shell | ✅ Done |
| Vòng 2 | Student Reward Profile | 🔲 Pending |
| Vòng 3 | Point Transactions + Rules | 🔲 Pending |
| Vòng 4 | Reward Catalog | 🔲 Pending |
| Vòng 5 | Redemption Flow | 🔲 Pending |
| Vòng 6 | Inventory + Approval | 🔲 Pending |
| Vòng 7 | Reports | 🔲 Pending |
| Vòng 8 | Dashboard + Polish + Audit | 🔲 Pending |

## Project Structure

```
reward-system/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root redirect (→ /login or /dashboard)
│   ├── globals.css             # Global styles + Tailwind
│   ├── login/page.tsx          # Login page
│   └── (dashboard)/
│       ├── layout.tsx          # Dashboard shell (sidebar + header)
│       └── dashboard/page.tsx  # Welcome dashboard
├── components/
│   ├── Sidebar.tsx             # Left navigation sidebar
│   └── Header.tsx              # Top header with logout
├── lib/
│   ├── types.ts                # TypeScript types
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       └── server.ts           # Server Supabase client
├── middleware.ts               # Route protection
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

## Design System

- **Font**: Plus Jakarta Sans
- **Primary color**: Indigo-600 (`#4f46e5`)
- **Background**: Slate-50 (`#f8fafc`)
- **Cards**: `rounded-2xl`, `shadow-card`, `p-6`
- **Brand tone**: Bright, modern, educational — MindX style
