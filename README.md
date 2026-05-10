# LeadFlow CRM

A cloud-based lead generation CRM built on Next.js + Supabase, deployable for free.

**Features:** Team login · Add/Edit/Delete leads · Lead scores (1–100) · Status tracking · Notes · Follow-up dates · CSV import/export · AI outreach emails (optional) · Dashboard with key metrics.

---

## ─── STEP-BY-STEP SETUP ──────────────────────────────────────────────────────

Estimated time: **20–30 minutes** (no coding experience needed)

---

### STEP 1 — Set Up Supabase (your database)

1. Go to **https://supabase.com** → click **"Start your project"**
2. Sign up with GitHub or email (free)
3. Click **"New project"** → give it a name (e.g. `leadflow`) → choose a region close to you → set a database password (save it) → click **"Create new project"** (takes ~2 minutes)
4. Once ready, go to the left sidebar → **SQL Editor** → click **"New query"**
5. Open the file `supabase/schema.sql` from this project → **copy all the contents** → paste into the SQL editor → click **"Run"**
   - You should see "Success. No rows returned."
6. Go to **Settings** (gear icon, bottom left) → **API**
7. Copy two values — you'll need them soon:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (a long string starting with `eyJ...`)

---

### STEP 2 — Get the Code onto Your Computer

**Option A — Download ZIP (easiest for non-technical founders)**
- Download this project as a ZIP, unzip it somewhere on your computer

**Option B — Git clone**
```bash
git clone <your-repo-url>
cd leadflow-crm
```

---

### STEP 3 — Configure Your Environment

1. In the project folder, find the file `.env.local.example`
2. **Duplicate** it and rename the copy to `.env.local`
3. Open `.env.local` in any text editor (Notepad, TextEdit, VS Code)
4. Fill in the two values from Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

5. *(Optional)* For AI email generation, add your Anthropic key:
```
ANTHROPIC_API_KEY=sk-ant-...
```
   - Get a free key at https://console.anthropic.com
   - **The app works perfectly without this** — it will show a template instead

---

### STEP 4 — Test Locally (optional but recommended)

You need **Node.js** installed (free: https://nodejs.org — download the LTS version).

Open a terminal in the project folder and run:

```bash
npm install
npm run dev
```

Visit **http://localhost:3000** in your browser. You should see the login page.

Create an account → you're in!

---

### STEP 5 — Deploy to Vercel (live on the internet, free)

1. Go to **https://vercel.com** → sign up with GitHub (free Hobby plan)
2. Click **"Add New Project"** → **"Import Git Repository"**
   - If your code isn't on GitHub yet: push it there first, or use **Vercel CLI** (see below)
3. Select your repository → click **"Deploy"**
4. **Before deploying**, click **"Environment Variables"** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
   - `ANTHROPIC_API_KEY` → your Anthropic key (optional)
5. Click **"Deploy"** — takes ~2 minutes
6. You'll get a free URL like `https://leadflow-crm-abc.vercel.app`

**Alternative — Vercel CLI (if not using GitHub):**
```bash
npm install -g vercel
vercel
# Follow the prompts — it will ask for env variables
```

---

### STEP 6 — Invite Your Team

1. Your team signs up at your Vercel URL using their own email/password
2. All team members share the same leads database automatically
3. To disable public signups (invite-only), go to:
   **Supabase Dashboard → Authentication → Settings → Disable "Enable Email Signup"**
   Then manually invite users via **Authentication → Users → Invite user**

---

## ─── PROJECT STRUCTURE ───────────────────────────────────────────────────────

```
leadflow-crm/
│
├── app/                          # Next.js App Router pages
│   ├── layout.js                 # Root HTML layout
│   ├── page.js                   # Redirects to /dashboard
│   ├── globals.css               # Global styles
│   ├── login/
│   │   └── page.js               # Login + signup page
│   ├── dashboard/
│   │   └── page.js               # Dashboard with stats
│   ├── leads/
│   │   └── page.js               # Leads table + CRUD + CSV
│   └── api/
│       └── generate-email/
│           └── route.js          # AI email generation endpoint
│
├── components/
│   ├── Navbar.jsx                # Navigation bar
│   └── LeadForm.jsx              # Add/edit lead modal
│
├── lib/
│   ├── supabase.js               # Supabase client
│   └── utils.js                  # Shared constants & helpers
│
├── supabase/
│   └── schema.sql                # Database schema (run this in Supabase)
│
├── middleware.js                 # Auth route protection
├── .env.local.example            # Environment variable template
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind CSS config
└── next.config.mjs               # Next.js config
```

---

## ─── CSV IMPORT FORMAT ───────────────────────────────────────────────────────

Your CSV file must have a header row with these column names (order doesn't matter):

| Column         | Required | Example                   |
|----------------|----------|---------------------------|
| name           | ✅ Yes   | Jane Smith                |
| email          | No       | jane@acme.com             |
| phone          | No       | +1 312 555 0100           |
| company        | No       | Acme Corp                 |
| status         | No       | Interested                |
| score          | No       | 75                        |
| notes          | No       | Spoke at conference       |
| follow_up_date | No       | 2026-06-15                |
| source         | No       | LinkedIn                  |

Valid status values: `New`, `Contacted`, `Interested`, `Closed`, `Not Interested`

---

## ─── COSTS ───────────────────────────────────────────────────────────────────

| Service    | Free Tier Limits                           | Paid if you exceed...        |
|------------|---------------------------------------------|------------------------------|
| Vercel     | Unlimited deploys, 100GB bandwidth/mo       | $20/mo Pro (rarely needed)   |
| Supabase   | 500MB DB, 50,000 MAU, 1GB storage          | $25/mo Pro                   |
| Anthropic  | $5 free credit (≈ 2,500 emails generated)  | Pay as you go after credit   |

**For most early-stage teams: $0/month forever.**

---

## ─── TROUBLESHOOTING ─────────────────────────────────────────────────────────

**"Invalid API key" or blank page after login**
→ Double-check your `.env.local` values match exactly what's in Supabase → Settings → API

**"new row violates row-level security policy"**
→ You forgot to run `supabase/schema.sql`. Go back to Step 1, step 5.

**Vercel deploy fails**
→ Make sure all 3 environment variables are set in Vercel → Project → Settings → Environment Variables

**Email confirmation loop**
→ Go to Supabase → Authentication → Settings → uncheck "Enable email confirmations" for development

**CSV import not working**
→ Make sure your CSV has a `name` column (required). Check the format table above.
