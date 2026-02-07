# Phase 2: Forging the Vessel

*"Before a spell can traverse the planes, it must be bound into a vessel that can survive the journey."*

---

## Preparing for Production

Let's transform your Aether Conduit into a production-ready server. This involves:

1. Adding production configurations
2. Implementing health checks
3. Setting up logging
4. Creating a Dockerfile

---

## Updated Project Structure

Your production project will look like:

```
aether-conduit/
├── server.py           # Main server with SSE support
├── pyproject.toml      # Dependencies
├── Dockerfile          # Container definition
├── docker-compose.yml  # Local testing
├── .env                # Local secrets (not committed)
├── .env.example        # Template for secrets
├── .dockerignore       # Files to exclude from container
└── .gitignore          # Files to exclude from git
```

---

## Step 1: Production Dependencies

Update your `pyproject.toml` to include production dependencies:

```toml
[project]
name = "aether-conduit"
version = "1.0.0"
description = "MCP server for weather and news"
requires-python = ">=3.10"
dependencies = [
    "fastmcp[cli]>=0.1.0",
    "httpx>=0.27.0",
    "python-dotenv>=1.0.0",
    "uvicorn>=0.29.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

Install the new dependencies:
```bash
uv sync
```

---

## Step 2: Add Health Check Resource

Production servers need health checks for monitoring. Add to `server.py`:

```python
from datetime import datetime

@mcp.resource("health://status")
def health_status() -> str:
    """
    Health check endpoint for monitoring.

    Returns server status and uptime information.
    Used by container orchestrators and monitoring systems.
    """
    return f"""# Aether Conduit Health Status

**Status:** Healthy
**Timestamp:** {datetime.now().isoformat()}
**Version:** 1.0.0

## Configuration
- Weather API: {"Configured" if OPENWEATHER_API_KEY else "Not configured"}
- News API: {"Configured" if NEWS_API_KEY else "Not configured"}
"""
```

---

## Step 3: Add Logging

Replace print statements with proper logging:

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("aether-conduit")


# In your tools, use:
logger.info(f"Weather request for city: {city}")
logger.error(f"API error: {str(e)}")
logger.warning("Rate limit approaching")
```

---

## Step 4: Create Dockerfile

Create `Dockerfile` in your project root:

```dockerfile
# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install uv (fast Python package manager)
RUN pip install uv

# Copy dependency files first (for better caching)
COPY pyproject.toml ./

# Install dependencies
RUN uv pip install --system -e .

# Copy application code
COPY server.py ./

# Expose the port (FastMCP default for SSE)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8080/health')" || exit 1

# Run the server with SSE transport
CMD ["python", "server.py", "--transport", "sse", "--host", "0.0.0.0", "--port", "8080"]
```

### Understanding the Dockerfile

| Instruction | Purpose |
|-------------|---------|
| `FROM python:3.11-slim` | Base image with Python |
| `WORKDIR /app` | Set working directory inside container |
| `RUN pip install uv` | Install package manager |
| `COPY pyproject.toml` | Copy dependencies first (caching) |
| `RUN uv pip install` | Install Python dependencies |
| `COPY server.py` | Copy your application |
| `EXPOSE 8080` | Document the port |
| `HEALTHCHECK` | Container health monitoring |
| `CMD` | Default command to run |

---

## Step 5: Create .dockerignore

Create `.dockerignore` to exclude unnecessary files:

```
# Git
.git
.gitignore

# Python
__pycache__
*.py[cod]
.venv
*.egg-info

# Environment files with secrets
.env
.env.local
.env.*.local

# IDE
.idea
.vscode
*.swp

# Testing
test_*.py
tests/

# Documentation
*.md
!README.md
```

---

## Step 6: Create docker-compose.yml

For local testing, create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  aether-conduit:
    build: .
    ports:
      - "8080:8080"
    environment:
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
      - NEWS_API_KEY=${NEWS_API_KEY}
    healthcheck:
      test: ["CMD", "python", "-c", "import httpx; httpx.get('http://localhost:8080/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## Step 7: Test Docker Locally

Build and run your container:

```bash
# Build the image
docker build -t aether-conduit .

# Run with environment variables from .env
docker run -p 8080:8080 --env-file .env aether-conduit

# Or using docker-compose
docker-compose up --build
```

### Verify It's Running

```bash
# Check health endpoint
curl http://localhost:8080/health

# Or in Python
python -c "import httpx; print(httpx.get('http://localhost:8080/health').text)"
```

---

## The Updated Server

Here's the production-ready `server.py` skeleton:

```python
from fastmcp import FastMCP
import httpx
import os
import logging
from datetime import datetime, timedelta
from typing import Optional, Any
from dotenv import load_dotenv

# Load environment variables (for local development)
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("aether-conduit")

# Create the server
mcp = FastMCP("Aether Conduit")

# API Configuration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_BASE_URL = "https://newsapi.org/v2"

# Log configuration status
logger.info("Aether Conduit starting...")
logger.info(f"Weather API: {'Configured' if OPENWEATHER_API_KEY else 'Not configured'}")
logger.info(f"News API: {'Configured' if NEWS_API_KEY else 'Not configured'}")

# ----- Caching System -----
_cache: dict[str, dict[str, Any]] = {}
CACHE_TTL = timedelta(minutes=5)


def get_cached(key: str) -> Optional[str]:
    """Get a value from cache if it exists and hasn't expired."""
    if key in _cache:
        entry = _cache[key]
        if datetime.now() < entry["expires"]:
            return entry["value"]
        else:
            del _cache[key]
    return None


def set_cached(key: str, value: str, ttl: timedelta = CACHE_TTL) -> None:
    """Store a value in cache with expiration."""
    _cache[key] = {
        "value": value,
        "expires": datetime.now() + ttl
    }


# ----- Health Check -----

@mcp.resource("health://status")
def health_status() -> str:
    """Health check for monitoring."""
    return f"""Status: Healthy
Timestamp: {datetime.now().isoformat()}
Weather: {'OK' if OPENWEATHER_API_KEY else 'No API key'}
News: {'OK' if NEWS_API_KEY else 'No API key'}"""


# ----- Tools -----
# (Include your weather and news tools here)


if __name__ == "__main__":
    mcp.run()
```

---

## Checklist Before Deployment

- [ ] `Dockerfile` created and tested locally
- [ ] `.dockerignore` excludes sensitive files
- [ ] Health check endpoint working
- [ ] Logging configured
- [ ] No secrets in code (all from environment)
- [ ] `docker build` succeeds
- [ ] `docker run` starts server
- [ ] Can access server at `localhost:8080`

---

## Understanding Container Best Practices

### 1. Use Slim Base Images
```dockerfile
# Good - smaller, faster
FROM python:3.11-slim

# Avoid - much larger
FROM python:3.11
```

### 2. Multi-Stage Builds (Advanced)
For production, consider:
```dockerfile
# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml .
RUN uv pip install --system -e .

# Production stage
FROM python:3.11-slim
COPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY server.py /app/
CMD ["python", "/app/server.py"]
```

### 3. Non-Root User (Security)
```dockerfile
RUN useradd -m appuser
USER appuser
```

---

## What's Next?

Your vessel is forged—a Docker container ready for the cloud. In Phase 3, you'll update the server to use SSE transport and prepare the final configuration for deployment.

*"The vessel is complete. Now we must attune it to traverse the planes."*

---

**Phase Complete!**

You've containerized your MCP server. Proceed to Phase 3 to configure SSE transport.
