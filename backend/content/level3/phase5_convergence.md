# Phase 5: The Convergence

*"Weather and news, united through your Conduit. The planes speak as one."*

---

## Testing the Complete Server

Your Aether Conduit now has two powerful tools. Let's thoroughly test the complete server and connect it to Claude Desktop.

### Launch the Inspector

```bash
cd aether-conduit
npx @modelcontextprotocol/inspector uv run python server.py
```

---

## Test Scenarios

### Test 1: Weather Divination

**Tool:** `get_weather`
**Input:** `"Tokyo"`

**Expected output:**
```
# Weather in Tokyo, JP

**Condition:** Clear (clear sky)
**Temperature:** 22.5°C (feels like 21.8°C)
**Humidity:** 45%
**Wind Speed:** 3.2 m/s
```

### Test 2: Weather Caching

1. Call `get_weather("Tokyo")`
2. Immediately call `get_weather("Tokyo")` again
3. Second response should include "[Cached response]"
4. Wait 5+ minutes, call again—should fetch fresh data

### Test 3: Chronicle Scrying

**Tool:** `get_news`
**Input:** `topic="technology"`, `count=3`

**Expected output:**
```
# News: Technology

1. **AI Advances Continue to Reshape Industry**
   *Source: Tech Chronicle*
   [Read more](https://...)

2. **New Framework Released for Cloud Development**
   *Source: Developer Weekly*
   [Read more](https://...)

3. **Startup Raises $50M for Quantum Computing**
   *Source: Venture Beat*
   [Read more](https://...)
```

### Test 4: Error Handling

- `get_weather("NonexistentCity123456")` → City not found
- `get_news("xyznonexistent")` → No news found (or valid response with niche topics)

---

## Connecting to Claude Desktop

### Step 1: Find Your Server Path

```bash
cd aether-conduit
pwd
# Example: /Users/yourname/aether-conduit
```

### Step 2: Configure Claude Desktop

Edit the Claude Desktop config file:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add your server:

```json
{
  "mcpServers": {
    "aether-conduit": {
      "command": "uv",
      "args": [
        "run",
        "python",
        "/full/path/to/aether-conduit/server.py"
      ],
      "env": {
        "OPENWEATHER_API_KEY": "your_api_key_here",
        "NEWS_API_KEY": "your_news_key_here"
      }
    }
  }
}
```

> **Note:** You can include environment variables directly in the config, or rely on the `.env` file in your project directory.

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to load the configuration.

---

## Example Conversations

Try these prompts with Claude:

### Weather Queries
> "What's the weather like in Paris right now?"

> "Compare the weather in Tokyo and London."

### News Queries
> "What are the latest technology news headlines?"

> "Give me 5 news articles about climate change."

### Combined Queries
> "What's the weather in San Francisco, and what are the latest tech news headlines?"

Claude will use both tools to answer!

---

## Level 3 Complete!

Congratulations, Artificer! You have mastered the Aetheric arts:

### Key Concepts Learned

1. **External API Integration**
   - Using httpx for async HTTP requests
   - Handling API authentication with environment variables
   - Parsing JSON responses

2. **Async Programming**
   - `async def` for non-blocking functions
   - `async with` for context managers
   - `await` for HTTP calls

3. **Caching Strategies**
   - In-memory cache with TTL
   - Cache key design
   - Stale data handling

4. **Error Handling**
   - Graceful degradation
   - Specific error messages
   - Rate limit awareness

5. **Environment Security**
   - .env files for secrets
   - Never committing API keys
   - Validation at startup

---

## Your Aether Conduit Summary

You built a server with:

| Tool | Purpose | Cache TTL |
|------|---------|-----------|
| `get_weather(city)` | Current weather data | 5 minutes |
| `get_news(topic, count)` | News headlines | 10 minutes |

---

## Production Considerations

For real-world deployment, consider:

### 1. Rate Limiting
```python
from datetime import datetime

_request_counts: dict[str, list[datetime]] = {}

def check_rate_limit(key: str, max_per_minute: int = 10) -> bool:
    now = datetime.now()
    minute_ago = now - timedelta(minutes=1)

    if key not in _request_counts:
        _request_counts[key] = []

    # Remove old requests
    _request_counts[key] = [t for t in _request_counts[key] if t > minute_ago]

    if len(_request_counts[key]) >= max_per_minute:
        return False

    _request_counts[key].append(now)
    return True
```

### 2. Persistent Cache (Redis)
For production, use Redis instead of in-memory cache to persist across restarts.

### 3. Logging
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Weather request for {city}")
logger.error(f"API error: {e}")
```

### 4. Health Checks
Add a resource for monitoring:
```python
@mcp.resource("health://status")
def health_check() -> str:
    return "OK"
```

---

## What Awaits in Level 4?

You've built powerful local servers. But how do you share them with the world? In **Level 4: The Blind Eternities**, you'll learn to:

- Convert from stdio to SSE transport
- Containerize with Docker
- Deploy to Railway or Fly.io
- Connect Claude Desktop to remote servers

*"Your creations serve you well. Soon they will serve the multiverse."*

---

## Quick Reference

### Async Tool Pattern
```python
@mcp.tool()
async def my_tool(param: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10.0)
        return response.json()
```

### Caching Pattern
```python
cached = get_cached(cache_key)
if cached:
    return cached

result = await fetch_data()
set_cached(cache_key, result)
return result
```

### Error Handling Pattern
```python
try:
    response = await client.get(url, timeout=10.0)
    response.raise_for_status()
except httpx.TimeoutException:
    return "Timeout error"
except httpx.HTTPStatusError as e:
    return f"HTTP error: {e.response.status_code}"
except Exception as e:
    return f"Unexpected error: {str(e)}"
```

---

**Level Complete!**

You have earned the rank of **Aether Walker**. Your Conduit channels knowledge from across the planes.

*"The bridges are built. The knowledge flows. You are ready for the final challenge."*
