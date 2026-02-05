# Phase 4: Traversing the Eternities

*"The journey across planes is fraught with complexity, but the destination makes it worthwhile."*

---

## Deploying to Railway

Railway is a modern cloud platform that makes deployment simple. You'll push your code, and Railway handles the rest.

---

## Prerequisites

Before deploying:

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Working Docker build** - Verified in Phase 3

---

## Step 1: Prepare Your Repository

Push your Aether Conduit to GitHub:

```bash
cd aether-conduit

# Initialize git if not already
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Secrets
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
.venv/
*.egg-info/

# IDE
.idea/
.vscode/
*.swp

# Docker
.docker/
EOF

# Add and commit
git add .
git commit -m "feat: production-ready MCP server"

# Create GitHub repo and push
# (Create repo on GitHub first, then:)
git remote add origin https://github.com/yourusername/aether-conduit.git
git push -u origin main
```

---

## Step 2: Connect Railway to GitHub

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `aether-conduit` repository
5. Railway will auto-detect your Dockerfile

---

## Step 3: Configure Environment Variables

In your Railway project:

1. Click on your service
2. Go to **"Variables"** tab
3. Add your secrets:

```
OPENWEATHER_API_KEY=your_api_key
NEWS_API_KEY=your_news_api_key
```

Railway encrypts these and injects them at runtime.

---

## Step 4: Configure Networking

Railway needs to know what port your app uses:

1. Go to **"Settings"** tab
2. Under **"Networking"**, set:
   - **Port:** `8080`

3. Click **"Generate Domain"** to get a public URL like:
   ```
   aether-conduit-production.up.railway.app
   ```

---

## Step 5: Deploy

Railway automatically deploys when you push to GitHub. You can also:

1. Click **"Deploy"** button for manual deploy
2. Watch the build logs in real-time
3. See deployment status

### Build Logs

Monitor the deployment:
```
Building Docker image...
Step 1/8 : FROM python:3.11-slim
Step 2/8 : WORKDIR /app
...
Successfully built abc123
Deploying...
Deployment live!
```

---

## Step 6: Verify Deployment

Once deployed, test your server:

```bash
# Replace with your Railway URL
curl https://aether-conduit-production.up.railway.app/

# Test with Inspector (if supported)
npx @modelcontextprotocol/inspector \
  --transport sse \
  --url https://aether-conduit-production.up.railway.app
```

---

## Connecting Claude Desktop to Remote Server

Update your Claude Desktop config to use the remote server:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "aether-conduit-remote": {
      "transport": "sse",
      "url": "https://aether-conduit-production.up.railway.app/mcp"
    }
  }
}
```

Restart Claude Desktop and try:
> "What's the weather in Tokyo?"

Your request now travels across the internet to your cloud server!

---

## Alternative Platforms

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set OPENWEATHER_API_KEY=xxx NEWS_API_KEY=xxx

# Deploy
fly deploy
```

### Render

1. Connect GitHub repo at [render.com](https://render.com)
2. Create "New Web Service"
3. Configure:
   - Environment: Docker
   - Port: 8080
4. Add environment variables
5. Deploy

### Self-Hosted (VPS)

For full control on a VPS (DigitalOcean, Linode, etc.):

```bash
# On your VPS
git clone https://github.com/yourusername/aether-conduit.git
cd aether-conduit

# Create .env with your keys
nano .env

# Build and run
docker build -t aether-conduit .
docker run -d -p 8080:8080 --env-file .env --name mcp-server aether-conduit

# Set up nginx reverse proxy with SSL (recommended)
```

---

## Production Best Practices

### 1. Use HTTPS

Railway provides HTTPS automatically. For self-hosted:
```bash
# Use Caddy for automatic HTTPS
caddy reverse-proxy --from your-domain.com --to localhost:8080
```

### 2. Monitor Your Service

Railway provides:
- Deploy logs
- Runtime logs
- Metrics dashboard

Set up alerts for:
- Deployment failures
- High error rates
- Service restarts

### 3. Implement Rate Limiting

Protect against abuse:

```python
from collections import defaultdict
from datetime import datetime, timedelta

_rate_limits = defaultdict(list)

def check_rate_limit(client_id: str, max_requests: int = 60) -> bool:
    """Allow max_requests per minute per client."""
    now = datetime.now()
    minute_ago = now - timedelta(minutes=1)

    # Clean old requests
    _rate_limits[client_id] = [
        t for t in _rate_limits[client_id] if t > minute_ago
    ]

    if len(_rate_limits[client_id]) >= max_requests:
        return False

    _rate_limits[client_id].append(now)
    return True
```

### 4. Handle Graceful Shutdown

```python
import signal
import sys

def shutdown_handler(signum, frame):
    logger.info("Shutting down gracefully...")
    # Cleanup resources
    sys.exit(0)

signal.signal(signal.SIGTERM, shutdown_handler)
signal.signal(signal.SIGINT, shutdown_handler)
```

---

## Troubleshooting Deployment

### Build Fails

- Check Docker builds locally first
- Review Railway build logs
- Ensure all dependencies in pyproject.toml

### App Crashes on Start

- Check Railway runtime logs
- Verify environment variables set correctly
- Test locally with same environment

### Can't Connect

- Verify networking configured (port 8080)
- Check domain was generated
- Ensure HTTPS URL used

### Slow Responses

- Check API rate limits
- Review caching effectiveness
- Consider Railway region closer to your users

---

## Cost Considerations

| Platform | Free Tier | Paid |
|----------|-----------|------|
| Railway | $5 credit/month | $5-20/month |
| Fly.io | Limited free | Pay-as-you-go |
| Render | Free tier (slow) | $7/month |
| DigitalOcean | - | $4-6/month VPS |

For personal projects, free tiers are usually sufficient.

---

## What's Next?

Your MCP server is now live in the cloud! In Phase 5, we'll celebrate your achievement and discuss the future of your MCP journey.

*"You have traversed the Eternities. Your creation lives beyond your plane."*

---

**Phase Complete!**

You've deployed your MCP server to the cloud. Proceed to Phase 5 for the final celebration.
