# Deployment Guide

This guide covers deploying The Artificer's Academy to production using Vercel (frontend) and Railway (backend).

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://artificers-academy.vercel.app |
| Backend API | https://artificers-academy-production.up.railway.app |
| Supabase | https://ywqcuhwpinyanmrxqkos.supabase.co |

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (free tier works)
- Railway account (free tier works)
- Supabase project set up (see [supabase/README.md](supabase/README.md))

---

## 1. Supabase Setup (Database & Auth)

### Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your credentials from **Settings > API**:
   - Project URL
   - `anon` public key (for frontend)
   - `service_role` key (for backend)

### Configure Authentication

1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to your Vercel URL: `https://your-app.vercel.app`
3. Add **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/auth/callback`

### Create Database Tables

Run these SQL commands in the Supabase SQL Editor:

```sql
-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  level_id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  code_snapshot TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMPORTANT: Add unique constraint for upserts
ALTER TABLE user_progress
ADD CONSTRAINT user_progress_unique_user_level_phase
UNIQUE (user_id, level_id, phase_id);

-- Code Snippets table
CREATE TABLE IF NOT EXISTS code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  level_id TEXT NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for code_snippets
CREATE POLICY "Users can view own snippets" ON code_snippets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snippets" ON code_snippets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snippets" ON code_snippets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snippets" ON code_snippets
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 2. Backend Deployment (Railway)

### Step 1: Connect Repository

1. Go to [Railway](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select the `artificers-academy` repository
4. Choose the `backend` directory as the root directory

### Step 2: Configure Environment Variables

In Railway project settings, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Your Supabase service role key |
| `ENVIRONMENT` | `production` | Environment flag |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Vercel URL (for CORS) |

### Step 3: Deploy

Railway will automatically build and deploy. Once complete:

1. Go to **Settings** → **Networking** → **Generate Domain**
2. Note the generated URL (e.g., `https://artificers-academy-production.up.railway.app`)
3. Verify the deployment:
   ```bash
   curl https://your-app.up.railway.app/health
   # Should return: {"status":"healthy","database":"connected","environment":"production"}
   ```

---

## 3. Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Go to [Vercel](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import the `artificers-academy` repository
4. Set the **Root Directory** to `frontend`

### Step 2: Configure Environment Variables

Add these environment variables in Vercel:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Your Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | `https://your-app.up.railway.app` | **Must include `https://`** |

> **IMPORTANT:** The `NEXT_PUBLIC_API_URL` must include the full protocol (`https://`). Without it, API calls will fail with 404 errors.

### Step 3: Deploy

Click **"Deploy"**. Vercel will build and deploy automatically.

---

## 4. Post-Deployment Configuration

### Update Backend CORS

After getting your Vercel URL:

1. Go to Railway project settings
2. Update `FRONTEND_URL` to your Vercel production URL
3. Railway will auto-redeploy

### Update Supabase Auth URLs

1. Go to Supabase **Authentication > URL Configuration**
2. Set **Site URL** to your Vercel URL
3. Add redirect URLs for your Vercel domain

### Verify Full Deployment

1. **Backend Health:**
   ```bash
   curl https://your-railway-url/health
   ```

2. **Frontend:** Visit your Vercel URL, should see login page

3. **Auth Flow:** Register a new account and verify login works

4. **Full Flow:** Navigate to Level 1, complete a phase, verify progress saves

---

## Environment Variables Summary

### Backend (Railway)

```env
SUPABASE_URL=https://ywqcuhwpinyanmrxqkos.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-key
ENVIRONMENT=production
FRONTEND_URL=https://artificers-academy.vercel.app
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://ywqcuhwpinyanmrxqkos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
NEXT_PUBLIC_API_URL=https://artificers-academy-production.up.railway.app
```

---

## Troubleshooting

### Authentication Issues

**"Auth session missing" error:**
- Ensure `@supabase/ssr` package is version **0.8.0 or higher**
- Older versions (0.1.0) have known cookie handling bugs with Next.js 14+
- Update with: `npm install @supabase/ssr@latest`

**Redirects back to login:**
- Check Supabase Site URL matches your Vercel URL exactly
- Verify redirect URLs are configured in Supabase Auth settings
- Clear browser cookies and try again

### API Errors

**404 on API calls:**
- Ensure `NEXT_PUBLIC_API_URL` includes `https://` protocol
- Verify the Railway URL is correct

**500 on progress save:**
- Check the `user_progress` table has the unique constraint
- Run: `ALTER TABLE user_progress ADD CONSTRAINT user_progress_unique_user_level_phase UNIQUE (user_id, level_id, phase_id);`

**"Table not found" errors:**
- Run the database migration SQL in Supabase SQL Editor
- Verify tables exist in Supabase Table Editor

### CORS Errors

- Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check that the URL doesn't have a trailing slash
- Verify Railway redeployed after changing the variable

### Build Failures

**Frontend (Vercel):**
- Check Node.js version (should be 18+)
- Run `npm run build` locally to debug
- Check for TypeScript errors

**Backend (Railway):**
- Check Python version (should be 3.12+)
- Verify all dependencies are in `pyproject.toml`
- Check Railway build logs for errors

---

## Updating Deployments

Both Vercel and Railway auto-deploy when you push to `main`:

```bash
git push origin main
```

For manual deployments:
- **Vercel:** Dashboard → Deployments → Redeploy
- **Railway:** Dashboard → Deployments → Redeploy

---

## CLI Access (Optional)

For debugging, you can use the service CLIs:

```bash
# Vercel CLI
npx vercel --token YOUR_TOKEN projects ls

# Railway CLI
RAILWAY_TOKEN=YOUR_TOKEN npx @railway/cli status

# Supabase CLI
SUPABASE_ACCESS_TOKEN=YOUR_TOKEN npx supabase projects list
```

Generate tokens from:
- Vercel: https://vercel.com/account/tokens
- Railway: https://railway.app/account/tokens
- Supabase: https://supabase.com/dashboard/account/tokens
