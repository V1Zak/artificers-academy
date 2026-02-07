# Cloud Deployment (Railway)

## Railway Overview

Railway is a cloud platform that deploys applications from Docker containers or directly from Git repositories. It provides automatic HTTPS, environment variable management, and persistent URLs suitable for hosting MCP servers.

## Prerequisites

1. A Railway account (https://railway.app)
2. The Railway CLI installed:

```bash
npm install -g @railway/cli
```

3. Authenticate the CLI:

```bash
railway login
```

## Deploying from a Dockerfile

Railway detects `Dockerfile` in your repository root and builds automatically.

### Step 1: Initialize a Railway Project

```bash
# From your project directory
railway init
```

Select "Empty Project" when prompted. This creates a new Railway project linked to your local directory.

### Step 2: Configure Environment Variables

Set your API keys in Railway's environment (not in the container):

```bash
railway variables set OPENWEATHER_API_KEY=your_key_here
```

These variables are injected at runtime, keeping secrets out of your Docker image and Git history.

### Step 3: Deploy

```bash
railway up
```

Railway builds your Docker image in the cloud and deploys it. The output includes a deployment URL like:

```
Deploying from Dockerfile
Build Logs: https://railway.app/project/.../deployments/...

Deployment URL: mcp-api-server-production.up.railway.app
```

### Step 4: Generate a Public URL

By default, Railway deployments are not publicly accessible. Enable a public domain:

```bash
railway domain
```

This generates a URL like `mcp-api-server-production.up.railway.app` with automatic HTTPS.

## Verifying the Deployment

Test the SSE endpoint:

```bash
curl -N https://mcp-api-server-production.up.railway.app/sse
```

You should receive the SSE stream with the `endpoint` event. Test a tool call:

```bash
curl -N https://mcp-api-server-production.up.railway.app/sse &

curl -X POST "https://mcp-api-server-production.up.railway.app/messages?session_id=test" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

## Railway Configuration

For more control, create a `railway.toml` in your project root:

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/sse"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

This configures:
- **Health checks**: Railway pings `/sse` to verify the server is responsive.
- **Restart policy**: Automatically restarts the server on crashes (up to 3 retries).

## Port Configuration

Railway sets the `PORT` environment variable automatically. Update your server to respect it:

```python
import os

port = int(os.getenv("PORT", "8000"))

mcp = FastMCP(
    "API Server",
    host="0.0.0.0",
    port=port
)
```

This allows Railway to assign the port dynamically while maintaining a default for local development.

## Connecting Claude Desktop to the Remote Server

Update `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "remote-api-server": {
      "url": "https://mcp-api-server-production.up.railway.app/sse"
    }
  }
}
```

Restart Claude Desktop. The tools should appear as before, but now they execute on the cloud server rather than locally.

## Continuous Deployment

Link your Git repository for automatic deployments:

```bash
railway link
```

Every push to your main branch triggers a rebuild and deployment. This integrates with standard CI/CD workflows.

## Monitoring

View server logs in real time:

```bash
railway logs
```

Or through the Railway dashboard at https://railway.app. Monitor for errors, slow responses, and unexpected behavior during initial deployment.
