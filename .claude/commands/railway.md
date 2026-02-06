# Railway Deployment Skill

Manage Railway deployments for The Artificer's Academy backend.

## Project Info
- **Project:** artificers-academy
- **Production URL:** https://artificers-academy-production.up.railway.app
- **Framework:** FastAPI (Python 3.12+)
- **Package Manager:** uv

## Available Commands

When this skill is invoked, use the Railway CLI with the RAILWAY_TOKEN environment variable:

### Check Service Status
```bash
RAILWAY_TOKEN=$RAILWAY_TOKEN npx @railway/cli status
```

### View Logs
```bash
RAILWAY_TOKEN=$RAILWAY_TOKEN npx @railway/cli logs
```

### List Variables
```bash
RAILWAY_TOKEN=$RAILWAY_TOKEN npx @railway/cli variables
```

### Deploy
```bash
RAILWAY_TOKEN=$RAILWAY_TOKEN npx @railway/cli up
```

### Open Dashboard
```bash
RAILWAY_TOKEN=$RAILWAY_TOKEN npx @railway/cli open
```

### Run Command in Service
```bash
RAILWAY_TOKEN=$RAILWAY_TOKEN npx @railway/cli run <command>
```

## Environment Variables Required
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `PORT` (Railway sets automatically)

## API Endpoints
- `GET /` - Health check
- `GET /api/curriculum` - Get all levels and phases
- `GET /api/content/{level_id}/{phase_id}` - Get phase content
- `POST /api/validate` - Validate MCP code
- `GET /api/progress` - Get user progress (requires auth)
- `POST /api/progress` - Update user progress (requires auth)

## Common Issues
1. **500 on progress save**: Check Supabase unique constraint exists
2. **CORS errors**: Verify CORS configuration in main.py
3. **Import errors**: Run `uv sync` to update dependencies

## Usage
Invoke with `/railway` followed by what you want to do:
- `/railway status` - Check service status
- `/railway logs` - View recent logs
- `/railway deploy` - Deploy latest changes
- `/railway vars` - List environment variables
