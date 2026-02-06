# Vercel Deployment Skill

Manage Vercel deployments for The Artificer's Academy frontend.

## Project Info
- **Project:** artificers-academy
- **Production URL:** https://artificers-academy.vercel.app
- **Framework:** Next.js 14 (App Router)

## Available Commands

When this skill is invoked, determine what the user needs and run the appropriate commands:

### Check Deployment Status
```bash
npx vercel ls --token $VERCEL_TOKEN
```

### View Recent Deployments
```bash
npx vercel ls artificers-academy --token $VERCEL_TOKEN
```

### Check Environment Variables
```bash
npx vercel env ls --token $VERCEL_TOKEN
```

### Promote to Production
```bash
npx vercel promote <deployment-url> --token $VERCEL_TOKEN
```

### View Logs
```bash
npx vercel logs <deployment-url> --token $VERCEL_TOKEN
```

### Redeploy
```bash
cd frontend && npx vercel --prod --token $VERCEL_TOKEN
```

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (must include https://)

## Common Issues
1. **404 errors on API calls**: Ensure `NEXT_PUBLIC_API_URL` has `https://` prefix
2. **Auth session missing**: Check `@supabase/ssr` version is 0.8.0+
3. **Build failures**: Check Next.js build logs for TypeScript errors

## Usage
Invoke with `/vercel` followed by what you want to do:
- `/vercel status` - Check deployment status
- `/vercel logs` - View recent logs
- `/vercel deploy` - Deploy to production
- `/vercel env` - List environment variables
