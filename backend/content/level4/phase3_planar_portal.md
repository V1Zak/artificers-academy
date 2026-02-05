# Phase 3: The Planar Portal

*"The portal between planes requires precise calibration. SSE is the frequency of the Eternities."*

---

## Converting to SSE Transport

FastMCP makes it easy to switch from stdio to SSE transport. Let's update your server to work over HTTP.

---

## Understanding SSE Transport

When using SSE transport, your server:

1. **Listens on a port** - HTTP server at `0.0.0.0:8080`
2. **Accepts connections** - Clients connect via HTTP
3. **Streams responses** - Uses Server-Sent Events for data
4. **Handles CORS** - Allows cross-origin requests

```
┌─────────────┐       HTTP/SSE        ┌─────────────┐
│   Claude    │ ←────────────────────→ │   Your MCP  │
│   Desktop   │  https://your.app:8080 │   Server    │
└─────────────┘                        └─────────────┘
```

---

## Server Configuration for SSE

Update your `server.py` to support SSE:

```python
from fastmcp import FastMCP
import httpx
import os
import logging
import argparse
from datetime import datetime, timedelta
from typing import Optional, Any
from dotenv import load_dotenv

# Load environment variables
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

# ----- Caching System -----
_cache: dict[str, dict[str, Any]] = {}
CACHE_TTL = timedelta(minutes=5)


def get_cached(key: str) -> Optional[str]:
    if key in _cache:
        entry = _cache[key]
        if datetime.now() < entry["expires"]:
            return entry["value"]
        del _cache[key]
    return None


def set_cached(key: str, value: str, ttl: timedelta = CACHE_TTL) -> None:
    _cache[key] = {"value": value, "expires": datetime.now() + ttl}


# ----- Health Check -----

@mcp.resource("health://status")
def health_status() -> str:
    """Health check for monitoring and load balancers."""
    return f"OK - {datetime.now().isoformat()}"


# ----- Weather Tool -----

@mcp.tool()
async def get_weather(city: str) -> str:
    """
    Get the current weather for a city.

    Args:
        city: Name of the city (e.g., "London", "Tokyo")

    Returns:
        Formatted weather report.
    """
    if not OPENWEATHER_API_KEY:
        return "Weather unavailable: No API key configured."

    cache_key = f"weather:{city.lower()}"
    cached = get_cached(cache_key)
    if cached:
        return cached + "\n\n*[Cached]*"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{OPENWEATHER_BASE_URL}/weather",
                params={
                    "q": city,
                    "appid": OPENWEATHER_API_KEY,
                    "units": "metric"
                },
                timeout=10.0
            )

        if response.status_code == 404:
            return f"City '{city}' not found."

        response.raise_for_status()
        data = response.json()

        name = data.get("name", city)
        country = data.get("sys", {}).get("country", "")
        temp = data.get("main", {}).get("temp", "N/A")
        feels_like = data.get("main", {}).get("feels_like", "N/A")
        humidity = data.get("main", {}).get("humidity", "N/A")
        wind = data.get("wind", {}).get("speed", "N/A")
        weather = data.get("weather", [{}])[0]
        condition = weather.get("main", "Unknown")
        desc = weather.get("description", "")

        result = f"""# Weather in {name}, {country}

**Condition:** {condition} ({desc})
**Temperature:** {temp}°C (feels like {feels_like}°C)
**Humidity:** {humidity}%
**Wind:** {wind} m/s"""

        set_cached(cache_key, result)
        logger.info(f"Weather fetched for {city}")
        return result

    except httpx.TimeoutException:
        logger.error(f"Timeout fetching weather for {city}")
        return "Weather request timed out."
    except Exception as e:
        logger.error(f"Weather error: {str(e)}")
        return f"Weather error: {str(e)}"


# ----- News Tool -----

@mcp.tool()
async def get_news(topic: str, count: int = 5) -> str:
    """
    Get the latest news headlines on a topic.

    Args:
        topic: Topic to search for (e.g., "technology", "climate")
        count: Number of headlines (default 5, max 10)

    Returns:
        Formatted list of headlines.
    """
    if not NEWS_API_KEY:
        return "News unavailable: No API key configured."

    count = min(max(1, count), 10)
    cache_key = f"news:{topic.lower()}:{count}"
    cached = get_cached(cache_key)
    if cached:
        return cached + "\n\n*[Cached]*"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NEWS_API_BASE_URL}/everything",
                params={
                    "q": topic,
                    "apiKey": NEWS_API_KEY,
                    "pageSize": count,
                    "sortBy": "publishedAt",
                    "language": "en"
                },
                timeout=10.0
            )

        if response.status_code == 429:
            return "Rate limit exceeded. Try again later."

        response.raise_for_status()
        data = response.json()
        articles = data.get("articles", [])

        if not articles:
            return f"No news found for '{topic}'."

        headlines = [f"# News: {topic.title()}\n"]
        for i, article in enumerate(articles, 1):
            title = article.get("title", "No title")
            source = article.get("source", {}).get("name", "Unknown")
            headlines.append(f"{i}. **{title}**")
            headlines.append(f"   *{source}*\n")

        result = "\n".join(headlines)
        set_cached(cache_key, result, timedelta(minutes=10))
        logger.info(f"News fetched for {topic}")
        return result

    except Exception as e:
        logger.error(f"News error: {str(e)}")
        return f"News error: {str(e)}"


# ----- Main Entry Point -----

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aether Conduit MCP Server")
    parser.add_argument("--transport", choices=["stdio", "sse"], default="stdio")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()

    logger.info(f"Starting Aether Conduit with {args.transport} transport")

    if args.transport == "sse":
        logger.info(f"Listening on {args.host}:{args.port}")
        mcp.run(transport="sse", host=args.host, port=args.port)
    else:
        mcp.run()
```

---

## Running with SSE

### Locally

```bash
# SSE mode (for remote access)
uv run python server.py --transport sse --port 8080

# Or with stdio (for local Claude Desktop)
uv run python server.py
```

### With Docker

```bash
# Build
docker build -t aether-conduit .

# Run with SSE
docker run -p 8080:8080 --env-file .env aether-conduit
```

---

## Testing SSE Transport

When running in SSE mode, you can test with curl:

```bash
# Check if server is responding
curl http://localhost:8080/

# The health check via MCP protocol
# (exact endpoint depends on FastMCP version)
```

You can also use the MCP Inspector in SSE mode:

```bash
# Connect Inspector to SSE server
npx @modelcontextprotocol/inspector --transport sse --url http://localhost:8080
```

---

## CORS Configuration

If you need to access your server from web browsers, configure CORS:

```python
# In FastMCP, CORS is typically handled automatically for SSE
# But you can customize if needed

mcp = FastMCP(
    "Aether Conduit",
    cors_origins=["https://your-frontend.com"]
)
```

---

## Validation Requirements

Your SSE-enabled server must have:

- [ ] Command-line argument for transport type
- [ ] `--host 0.0.0.0` to allow external connections
- [ ] `--port` configuration
- [ ] Health check resource
- [ ] Logging for debugging
- [ ] Graceful error handling

---

## Updated Dockerfile

Make sure your Dockerfile runs in SSE mode:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy and install dependencies
COPY pyproject.toml ./
RUN uv pip install --system -e .

# Copy application
COPY server.py ./

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8080/', timeout=5)" || exit 1

# Run with SSE transport
CMD ["python", "server.py", "--transport", "sse", "--host", "0.0.0.0", "--port", "8080"]
```

---

## Environment Variables for Production

Create a `.env.production` template:

```bash
# Production environment variables
OPENWEATHER_API_KEY=your_production_key
NEWS_API_KEY=your_production_key

# Optional: Custom configuration
LOG_LEVEL=INFO
CACHE_TTL_MINUTES=5
```

In production, these will be set in your cloud platform's secret management.

---

## Testing the Complete Flow

### Step 1: Run Locally with SSE

```bash
docker-compose up --build
```

### Step 2: Verify Health

```bash
curl http://localhost:8080/
```

### Step 3: Test with Inspector

```bash
npx @modelcontextprotocol/inspector --transport sse --url http://localhost:8080
```

Use the Inspector to:
- View available tools and resources
- Test `get_weather("London")`
- Test `get_news("technology")`
- Verify caching works

---

## Common SSE Issues

### Port Already in Use
```bash
# Find what's using port 8080
lsof -i :8080

# Kill it or use a different port
docker run -p 8081:8080 --env-file .env aether-conduit
```

### Connection Refused
- Verify server is running: `docker ps`
- Check logs: `docker logs <container_id>`
- Ensure firewall allows the port

### Timeout Errors
- Increase client timeout
- Check network connectivity
- Verify API keys are valid

---

## What's Next?

Your portal is configured and tested locally. In Phase 4, you'll traverse the Eternities—deploying to Railway and connecting from anywhere.

*"The portal is attuned. The frequencies align. We are ready to cross."*

---

**Phase Complete!**

You've configured SSE transport. Proceed to Phase 4 to deploy to the cloud.
