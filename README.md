# ♟️ Monsoon Chess Knockout Manager

A **fully functional, production-ready web application** for managing college-level knockout chess tournaments. Upload a player list via Excel, randomize pairings, enter match results round-by-round, and crown a champion — all from any device, in real time.

> **Live URL**: _Add your Vercel URL here after deployment_
> **Built for**: Monsoon Sports Chess Tournament

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Database Schema](#-database-schema)
- [Application Structure](#-application-structure)
- [How It Works](#-how-it-works)
- [Bye / Non-Power-of-Two Handling](#-bye--non-power-of-two-handling)
- [Round Naming](#-round-naming)
- [Setup — Local Development](#-setup--local-development)
- [Setup — Supabase](#-setup--supabase)
- [Setup — GitHub Repository](#-setup--github-repository)
- [Deployment — Vercel](#-deployment--vercel)
- [Environment Variables](#-environment-variables)
- [How to Run a Tournament](#-how-to-run-a-tournament)
- [Excel File Format](#-excel-file-format)
- [Admin Account](#-admin-account)
- [Testing Checklist](#-testing-checklist)
- [Limitations & Assumptions](#-limitations--assumptions)

---

## ✅ Features

### 🗂 Excel Upload & Player Management
- Upload `.xlsx` or `.xls` files via drag-and-drop or file picker
- Automatically extracts player names from the first column
- Ignores empty rows and trims whitespace
- Detects and warns about duplicate names
- Displays the full player list with sequential numbering
- Shows total player count before confirmation
- "Confirm Player List" step before any tournament data is written

### 🎲 Random Pairing Engine
- Uses **Fisher-Yates shuffle** seeded via `crypto.getRandomValues` for true randomness
- No alphabetical sorting, no ratings, no seeding
- Automatically handles non-power-of-two player counts via a **Preliminary Round** with byes
- Winners from the preliminary round join bye players in Round 1

### 🏆 Knockout Tournament Logic
- Single-elimination format
- Loser is immediately eliminated
- Winner progresses to the next round
- No double elimination, no consolation brackets
- Works for any player count (4, 8, 10, 16, 18, 20, 25, 32, 64, etc.)

### 📋 Match Result Interface
- Clean board cards: **Player A vs Player B**
- Two large, clearly-labelled winner buttons
- Confirmation dialog before saving any result
- Results are locked after confirmation
- **Edit Result** option to correct mistakes (admin only)
- Eliminated players are visually marked

### 🔄 Round Progression
- System tracks how many matches in a round are complete
- Displays: `X / Y Matches Completed`
- **Generate Next Round** button only appears when all matches are done
- Winners are randomly re-paired for the next round
- Eliminated players never re-appear

### 🏷 Automatic Round Naming
| Players Remaining | Round Name       |
|-------------------|------------------|
| Non-power-of-2    | Preliminary Round|
| > 32              | Round of N       |
| 32                | Round of 32      |
| 16                | Round of 16      |
| 8                 | Quarterfinals    |
| 4                 | Semifinals       |
| 2                 | Final            |

### 📜 Tournament History
- All previous rounds are preserved — never deleted
- History page shows every board from every round
- Each board shows: Player 1, Player 2, Winner ✓, Eliminated ✗

### 🏆 Final & Champion
- When 2 players remain, the **Final** is displayed prominently
- After the final result is entered:
  ```
  🏆 CHAMPION
  Player Name

  Runner-Up: Player Name
  ```

### 🌐 Public Tournament Page (`/tournament`)
- No login required
- Shows: tournament name, current round, all boards, results
- Previous rounds visible in collapsible history
- **Champion banner** displayed when tournament is complete
- Supabase Realtime for live updates without page refresh
- 30-second polling fallback if Realtime is unavailable

### 🔐 Admin Authentication
- Protected `/admin` area using **Supabase Auth**
- Email + password login
- No self-signup — admin account created manually in Supabase
- All mutating operations are verified server-side
- Session persists across browser refreshes

### 📊 Admin Dashboard
- Quick overview: tournament name, round, match completion status
- One-click navigation to: Players, Current Round, History, Final
- Optimized for fast use during a live event (mobile-friendly)

### 📱 Mobile Responsive
- Works on desktop, laptop, tablet, and mobile
- Winner buttons are large and thumb-friendly
- Match cards stack vertically on small screens
- Navigation collapses to a mobile menu

### 🔁 Multiple Tournaments
- Start a new tournament without deleting historical ones
- All historical tournaments remain accessible
- Only one tournament is "active" at a time

### 🛡 Safety & Error Handling
- Confirmation dialogs for all destructive actions
- Cannot generate next round until current round is complete
- Cannot re-submit a result for a locked match
- Eliminated players cannot re-enter any round
- User-friendly error messages (no raw stack traces)
- Handles: invalid Excel, empty Excel, duplicate names, network failures, unauthorized access

### 💾 Data Persistence
- All data stored in **Supabase PostgreSQL**
- Refreshing the browser restores full tournament state
- No data is ever stored only in browser memory or localStorage

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Excel Parsing | SheetJS (`xlsx`) |
| Icons | Lucide React |
| Deployment | Vercel |
| Hosting | GitHub → Vercel CI/CD |

---

## 🗄 Database Schema

```sql
-- Tournaments
CREATE TABLE tournaments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'setup',
  -- status: 'setup' | 'active' | 'complete'
  winner_id     UUID REFERENCES players(id),
  runner_up_id  UUID REFERENCES players(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Players
CREATE TABLE players (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  -- status: 'active' | 'eliminated' | 'champion'
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Rounds
CREATE TABLE rounds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number    INTEGER NOT NULL,
  round_name      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  -- status: 'active' | 'complete'
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Matches
CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id        UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  board_number    INTEGER NOT NULL,
  player1_id      UUID REFERENCES players(id),
  player2_id      UUID REFERENCES players(id),  -- NULL if bye
  winner_id       UUID REFERENCES players(id),
  is_bye          BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'pending',
  -- status: 'pending' | 'complete'
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (RLS)
| Table | Public (anon) | Admin (authenticated) |
|---|---|---|
| tournaments | SELECT | SELECT, INSERT, UPDATE, DELETE |
| players | SELECT | SELECT, INSERT, UPDATE, DELETE |
| rounds | SELECT | SELECT, INSERT, UPDATE, DELETE |
| matches | SELECT | SELECT, INSERT, UPDATE, DELETE |

---

## 📁 Application Structure

```
chess-knockout-manager/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Redirect to /tournament
│   │   ├── tournament/
│   │   │   └── page.tsx                  # Public live view
│   │   └── admin/
│   │       ├── layout.tsx                # Auth guard
│   │       ├── page.tsx                  # Dashboard
│   │       ├── login/
│   │       │   └── page.tsx              # Login form
│   │       ├── players/
│   │       │   └── page.tsx              # Excel upload
│   │       ├── rounds/
│   │       │   └── page.tsx              # Current round + results
│   │       └── history/
│   │           └── page.tsx              # All past rounds
│   ├── components/
│   │   ├── ui/                           # Button, Card, Badge, Modal, etc.
│   │   ├── admin/
│   │   │   ├── ExcelUpload.tsx
│   │   │   ├── PlayerList.tsx
│   │   │   ├── MatchCard.tsx
│   │   │   ├── RoundProgress.tsx
│   │   │   └── ResultConfirmModal.tsx
│   │   └── public/
│   │       ├── LiveRound.tsx
│   │       └── ChampionBanner.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser Supabase client
│   │   │   └── server.ts                 # Server Supabase client
│   │   ├── tournament/
│   │   │   ├── pairing.ts                # Fisher-Yates + bye logic
│   │   │   ├── roundNaming.ts            # Round name calculator
│   │   │   └── brackets.ts              # Bracket utilities
│   │   ├── excel/
│   │   │   └── parseExcel.ts             # SheetJS parser
│   │   └── types.ts                      # Shared TypeScript types
│   └── middleware.ts                     # Route protection
├── supabase/
│   └── schema.sql                        # Full database schema + RLS
├── .env.local.example                    # Environment variable template
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## ⚙️ How It Works

```
UPLOAD EXCEL (.xlsx)
       ↓
EXTRACT PLAYER NAMES
(trim, deduplicate, ignore blanks)
       ↓
DISPLAY PLAYER LIST
(e.g. "32 players loaded")
       ↓
CONFIRM PLAYERS
(admin clicks "Start Tournament")
       ↓
RANDOMIZE (Fisher-Yates shuffle)
       ↓
GENERATE ROUND 1
(or Preliminary Round if needed)
       ↓
PLAY MATCHES
       ↓
ADMIN CLICKS WINNER
(confirmation dialog)
       ↓
RESULT SAVED TO SUPABASE
       ↓
ALL MATCHES COMPLETE?
  → NO: Wait for remaining matches
  → YES: "Generate Next Round" appears
       ↓
GENERATE NEXT ROUND
(only winners are re-paired)
       ↓
REPEAT UNTIL 2 PLAYERS LEFT
       ↓
FINAL MATCH
       ↓
🏆 CHAMPION DECLARED
```

---

## 🔢 Bye / Non-Power-of-Two Handling

When the player count is not a power of two, the app calculates the nearest **lower** power of two and runs a **Preliminary Round**:

**Formula:**
```
targetSize  = nearest power of 2 ≥ playerCount
              (e.g. 10 players → target = 16... wait)

Actually:
prelim_matches = playerCount - nearestLowerPowerOf2
bye_count      = nearestHigherPowerOf2 - playerCount

Example: 10 players
  nearestHigherPowerOf2 = 16
  prelim_matches = 10 - 8 = ???
```

**Correct algorithm used:**
```
Given N players:
  target = smallest power of 2 ≥ N
  byes   = target - N

  If byes == 0: standard round, all N players play
  If byes > 0:
    - top `byes` players (randomly chosen) get a bye
    - remaining N - byes players play each other in pairs
    - After Preliminary: byes players + winners from prelim = target players
    - Target players then play Round 1 properly
```

**Example: 10 players**
```
Target = 16, byes = 6
→ 6 players get byes
→ Remaining 4 players play 2 matches in Preliminary Round
→ 2 winners + 6 bye players = 8 players in Round of 8 (Quarterfinals)
```

**Example: 18 players**
```
Target = 32, byes = 14
→ 14 players get byes
→ Remaining 4 players play 2 matches
→ 2 winners + 14 bye players = 16 players in Round of 16
```

Byes are displayed as:
```
Board 3
Player A — BYE (Auto-advances)
```

---

## 🚀 Setup — Local Development

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Git
- A Supabase account (free tier is fine)

### Step 1 — Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/chess-knockout-manager.git
cd chess-knockout-manager
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Configure environment variables
```bash
cp .env.local.example .env.local
```
Then edit `.env.local` with your Supabase credentials (see [Environment Variables](#-environment-variables)).

### Step 4 — Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Step 5 — Admin login
Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and log in with the credentials you created in Supabase.

---

## 🔧 Setup — Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"** and fill in:
   - **Project name**: `chess-knockout-manager`
   - **Database password**: (save this securely)
   - **Region**: Choose the closest to India (e.g., `ap-south-1`)
3. Wait for the project to be ready (~1 minute)
4. Go to **SQL Editor** in the Supabase dashboard
5. Copy and paste the contents of `supabase/schema.sql` and click **Run**
6. Go to **Project Settings → API**:
   - Copy **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon / public key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. To create an admin user:
   - Go to **Authentication → Users**
   - Click **"Add user"**
   - Enter admin email and password
   - Click **Create user**

> ⚠️ **Never** share your `service_role` key. It is not needed for this application.

---

## 🐙 Setup — GitHub Repository

Follow these steps to create a GitHub repository and push the project:

### Step 1 — Create a new repository on GitHub
1. Go to [https://github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name**: `chess-knockout-manager`
   - **Description**: `Monsoon Chess Knockout Tournament Manager`
   - **Visibility**: Public or Private (your choice)
   - ❌ Do NOT check "Add a README" (we already have one)
   - ❌ Do NOT add `.gitignore` (we already have one)
3. Click **"Create repository"**

### Step 2 — Initialize Git in the project folder
Open a terminal in the `chess-knockout-manager` folder:

```bash
git init
git add .
git commit -m "feat: initial project setup"
```

### Step 3 — Connect to GitHub
Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/chess-knockout-manager.git
git branch -M main
git push -u origin main
```

### Step 4 — Verify
Go to `https://github.com/YOUR_USERNAME/chess-knockout-manager` — you should see all the project files.

> 💡 After this, every time you want to push changes:
> ```bash
> git add .
> git commit -m "your commit message"
> git push
> ```

---

## ▲ Deployment — Vercel

### Step 1 — Import to Vercel
1. Go to [https://vercel.com](https://vercel.com) and sign in (use GitHub login)
2. Click **"Add New → Project"**
3. Find and select your `chess-knockout-manager` repository
4. Click **"Import"**

### Step 2 — Configure environment variables
In the **"Environment Variables"** section, add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Step 3 — Deploy
- Click **"Deploy"**
- Wait ~2 minutes for the build to complete
- Click the generated URL to visit your live site!

### Step 4 — Set up Supabase Auth redirect URL
1. Go to your Supabase project → **Authentication → URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   ```
3. Save

### Automatic re-deployment
Every time you push to `main` on GitHub, Vercel automatically rebuilds and redeploys.

---

## 🔑 Environment Variables

```bash
# .env.local (development)

# Supabase - Project URL (safe to expose to browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Supabase - Anonymous public key (safe to expose to browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> The `NEXT_PUBLIC_` prefix means these are available in the browser. This is intentional and safe for the anon key — Supabase Row Level Security protects your data.

---

## 🎮 How to Run a Tournament

### Before the event
1. Collect all player names
2. Create an Excel file (`.xlsx`) with player names in **Column A**, one name per row
3. No headers needed, but if a header row exists (e.g., "Player Name"), it will be detected and skipped

### During the event

**Step 1 — Login**
Go to `/admin/login` and log in.

**Step 2 — Upload players**
- Go to **Admin → Players**
- Drag and drop the Excel file (or click to browse)
- Review the extracted player list
- Click **"Confirm Players & Start Tournament"**

**Step 3 — Generate Round 1**
- The app automatically randomizes and generates the first round
- You'll see Board 1, Board 2, etc. with player pairings

**Step 4 — Enter results**
- For each board, click the winner's name
- Confirm in the dialog
- Repeat for all boards

**Step 5 — Generate next round**
- Once all matches are complete, click **"Generate Next Round"**
- Repeat steps 4-5 until only 2 players remain

**Step 6 — Final & Champion**
- Enter the final result
- The Champion screen is displayed automatically
- The public page at `/tournament` also shows the champion

---

## 📄 Excel File Format

The simplest valid Excel file:

| Column A     |
|--------------|
| Rishabh      |
| Arjun        |
| Priya        |
| Kavya        |
| Siddharth    |
| ...          |

**Rules:**
- Player names must be in **Column A** (first column)
- One name per row
- Rows with no name are ignored
- Leading/trailing spaces are removed
- Duplicate names are flagged and deduplicated (you will see a warning)
- The file must be `.xlsx` or `.xls`
- Maximum recommended: 256 players (practical limit: 64 for a single-day event)

**Supported header rows:**
If the first cell contains text like "Player Name", "Name", "Players", etc., it is automatically skipped.

---

## 👤 Admin Account

There is **no signup page** in the app. The admin account must be created directly in Supabase:

1. Supabase Dashboard → **Authentication → Users → Add user**
2. Enter email and password
3. Use these credentials at `/admin/login`

> To add more admin accounts (e.g., for assistants), simply add more users in Supabase Auth.

---

## ✅ Testing Checklist

| Test | Status |
|---|---|
| Upload 4-player Excel | ☐ |
| Upload 8-player Excel | ☐ |
| Upload 10-player Excel (with byes) | ☐ |
| Upload 16-player Excel | ☐ |
| Upload 25-player Excel | ☐ |
| Upload 32-player Excel | ☐ |
| Excel with empty rows | ☐ |
| Excel with duplicate names | ☐ |
| Invalid file type (e.g., .pdf) | ☐ |
| Empty Excel file | ☐ |
| Click winner → cancel confirmation | ☐ |
| Click winner → confirm | ☐ |
| Edit a confirmed result | ☐ |
| All matches complete → Next Round | ☐ |
| Try Next Round before all done | ☐ |
| Final match entered | ☐ |
| Champion screen | ☐ |
| Browser refresh mid-tournament | ☐ |
| Public page `/tournament` | ☐ |
| Admin logout | ☐ |
| Access `/admin` without login | ☐ |
| Vercel deployment | ☐ |
| Mobile layout on phone | ☐ |
| Supabase Realtime on public page | ☐ |

---

## ⚠️ Limitations & Assumptions

1. **Single active tournament**: Only one tournament can be "active" at a time. Historical tournaments are preserved but cannot be edited once completed.

2. **No player ratings or seeding**: The system intentionally has no concept of ratings, FIDE IDs, or seeds. All pairings are purely random (Fisher-Yates).

3. **No bracket prediction**: The app does not show a bracket tree / draw diagram in advance. It generates each round only after the previous one completes.

4. **No draw handling**: The system assumes every match has a decisive result (win/loss). Draws are not modeled. If a match is drawn in the actual game, the tournament director must decide the winner by any external method (blitz tiebreak, coin flip, etc.) and then record it.

5. **Single winner per board**: The app allows only one winner per match. No "walkovers" or "both eliminated" options.

6. **Bye randomness**: Byes are distributed randomly. The system does not try to give byes to specific players (e.g., no "top seed gets a bye").

7. **Browser required for admin**: The admin interface requires a modern browser with JavaScript enabled.

8. **Supabase free tier limits**: The free tier includes 500 MB database, 50,000 monthly active users, and 2 GB bandwidth — more than enough for a college tournament.

9. **No email notifications**: The app does not send emails for results or round updates.

10. **Offline mode**: If the internet fails while entering a result, the app will show an error and the result will NOT be saved. Re-enter the result when connectivity is restored.

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

## 👷 Built With

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SheetJS](https://sheetjs.com/)
- [Vercel](https://vercel.com/)

---

*Made for Monsoon Sports Chess Tournament* ♟️
