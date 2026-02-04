# Deployment Guide

This guide covers deploying The Artificer's Academy to production using Vercel (frontend) and Railway (backend).

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (free tier works)
- Railway account (free tier works)
- Supabase project (already set up)

---

## 1. Backend Deployment (Railway)

### Step 1: Connect Repository

1. Go to [Railway](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select the `artificers-academy` repository
4. Choose the `backend` directory as the root directory

### Step 2: Configure Environment Variables

In Railway project settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |
| `ENVIRONMENT` | `production` |
| `FRONTEND_URL` | Your Vercel URL (set after frontend deploy) |

### Step 3: Deploy

Railway will automatically build and deploy. Once complete:

1. Go to **Settings** → **Networking** → **Generate Domain**
2. Note the generated URL (e.g., `https://your-app.up.railway.app`)
3. Verify the deployment by visiting `/health`

---

## 2. Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Go to [Vercel](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import the `artificers-academy` repository
4. Set the **Root Directory** to `frontend`

### Step 2: Configure Environment Variables

Add these environment variables in Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL |

### Step 3: Deploy

Click **"Deploy"**. Vercel will build and deploy automatically.

---

## 3. Post-Deployment Configuration

### Update Backend CORS

After getting your Vercel URL:

1. Go to Railway project settings
2. Update `FRONTEND_URL` to your Vercel production URL
3. Railway will auto-redeploy

### Verify Deployment

1. **Frontend:** Visit your Vercel URL, should see login page
2. **Backend:** Visit `{railway-url}/health`, should return healthy status
3. **Auth:** Try registering a new account
4. **Full flow:** Navigate to Battlefield, complete a phase

---

## Environment Variables Summary

### Backend (Railway)

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
ENVIRONMENT=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

---

## Troubleshooting

### CORS Errors

- Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check that the URL doesn't have a trailing slash

### Database Connection Issues

- Verify Supabase credentials are correct
- Check Railway logs for connection errors

### Build Failures

**Frontend:**
- Check Node.js version (should be 18+)
- Run `npm run build` locally to debug

**Backend:**
- Check Python version (should be 3.12+)
- Verify all dependencies are in `requirements.txt`

---

## Updating Deployments

Both Vercel and Railway auto-deploy when you push to `main`:

```bash
git push origin main
```

For manual deployments:
- **Vercel:** Dashboard → Deployments → Redeploy
- **Railway:** Dashboard → Deployments → Redeploy
