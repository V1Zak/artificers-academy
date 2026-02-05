# Phase 4: The Chronicle Scrying

*"To know the weather is useful. To know the news is power. To cache both is wisdom."*

---

## Multi-Tool Servers with Caching

In this phase, you'll:
1. Add a news headlines tool
2. Implement a simple caching system
3. Combine both tools into a powerful Aether Conduit

---

## The Caching Pattern

Before adding more API calls, let's implement caching. This:
- Reduces API calls (saves your rate limit)
- Speeds up responses for repeated queries
- Shows good citizenship to API providers

### Simple In-Memory Cache

```python
from datetime import datetime, timedelta
from typing import Optional, Any

# Cache storage
_cache: dict[str, dict[str, Any]] = {}
CACHE_TTL = timedelta(minutes=5)


def get_cached(key: str) -> Optional[str]:
    """Get a value from cache if it exists and hasn't expired."""
    if key in _cache:
        entry = _cache[key]
        if datetime.now() < entry["expires"]:
            return entry["value"]
        else:
            # Expired, remove it
            del _cache[key]
    return None


def set_cached(key: str, value: str, ttl: timedelta = CACHE_TTL) -> None:
    """Store a value in cache with expiration."""
    _cache[key] = {
        "value": value,
        "expires": datetime.now() + ttl
    }
```

---

## Adding Cache to Weather

Update the weather tool to use caching:

```python
@mcp.tool()
async def get_weather(city: str) -> str:
    """
    Get the current weather for a city.

    Divines the atmospheric conditions in any city across the planes.
    Results are cached for 5 minutes to respect API limits.

    Args:
        city: Name of the city (e.g., "London", "Tokyo", "New York")

    Returns:
        Formatted weather report with current conditions.
    """
    if not OPENWEATHER_API_KEY:
        return "Weather divination unavailable: No API key configured."

    # Check cache first
    cache_key = f"weather:{city.lower()}"
    cached = get_cached(cache_key)
    if cached:
        return cached + "\n\n*[Cached response]*"

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

        # Format response (same as before)
        name = data.get("name", city)
        country = data.get("sys", {}).get("country", "")
        temp = data.get("main", {}).get("temp", "N/A")
        feels_like = data.get("main", {}).get("feels_like", "N/A")
        humidity = data.get("main", {}).get("humidity", "N/A")
        wind_speed = data.get("wind", {}).get("speed", "N/A")

        weather_list = data.get("weather", [])
        condition = weather_list[0].get("main", "Unknown") if weather_list else "Unknown"
        description = weather_list[0].get("description", "") if weather_list else ""

        result = f"""# Weather in {name}, {country}

**Condition:** {condition} ({description})
**Temperature:** {temp}°C (feels like {feels_like}°C)
**Humidity:** {humidity}%
**Wind Speed:** {wind_speed} m/s"""

        # Cache the result
        set_cached(cache_key, result)
        return result

    except httpx.TimeoutException:
        return "Weather divination timed out."
    except Exception as e:
        return f"Weather divination error: {str(e)}"
```

---

## Adding the News Tool

Now add a news headlines tool. This uses NewsAPI (or a fallback):

```python
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_BASE_URL = "https://newsapi.org/v2"


@mcp.tool()
async def get_news(topic: str, count: int = 5) -> str:
    """
    Get the latest news headlines on a topic.

    Scries the chronicles of the realm for recent news and events.
    Results are cached for 10 minutes.

    Args:
        topic: The topic to search for (e.g., "technology", "climate", "sports")
        count: Number of headlines to return (default 5, max 10)

    Returns:
        Formatted list of news headlines with sources.

    Examples:
        - "technology" returns tech news headlines
        - "climate change" returns environmental news
        - "sports" returns sports headlines
    """
    if not NEWS_API_KEY:
        return "Chronicle scrying unavailable: No NEWS_API_KEY configured."

    # Limit count
    count = min(max(1, count), 10)

    # Check cache
    cache_key = f"news:{topic.lower()}:{count}"
    cached = get_cached(cache_key)
    if cached:
        return cached + "\n\n*[Cached response]*"

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

        if response.status_code == 401:
            return "Chronicle scrying failed: Invalid API key."

        if response.status_code == 429:
            return "Chronicle scrying rate limit exceeded. Try again later."

        response.raise_for_status()
        data = response.json()

        articles = data.get("articles", [])
        if not articles:
            return f"No news found for topic '{topic}'."

        # Format headlines
        headlines = [f"# News: {topic.title()}\n"]
        for i, article in enumerate(articles, 1):
            title = article.get("title", "No title")
            source = article.get("source", {}).get("name", "Unknown source")
            url = article.get("url", "")

            headlines.append(f"{i}. **{title}**")
            headlines.append(f"   *Source: {source}*")
            if url:
                headlines.append(f"   [Read more]({url})")
            headlines.append("")

        result = "\n".join(headlines)

        # Cache for 10 minutes (news changes less frequently than weather)
        set_cached(cache_key, result, timedelta(minutes=10))
        return result

    except httpx.TimeoutException:
        return "Chronicle scrying timed out. The archives are busy."
    except Exception as e:
        return f"Chronicle scrying error: {str(e)}"
```

---

## Alternative: News Without API Key

If you don't have a NewsAPI key, here's a mock implementation for testing:

```python
@mcp.tool()
async def get_news(topic: str, count: int = 5) -> str:
    """
    Get the latest news headlines on a topic.

    Note: This is a demo implementation. Configure NEWS_API_KEY for real news.

    Args:
        topic: The topic to search for
        count: Number of headlines to return (default 5)

    Returns:
        News headlines (or demo data if no API key).
    """
    if not NEWS_API_KEY:
        # Demo response
        return f"""# News: {topic.title()} (Demo Mode)

1. **Configure NEWS_API_KEY for real headlines**
   *Source: System Message*

2. **Get your free API key at newsapi.org**
   *Source: Setup Guide*

*Note: This is demo data. Add NEWS_API_KEY to .env for live news.*
"""

    # ... rest of the real implementation
```

---

## The Complete Server

Your `server.py` should now have:

```python
from fastmcp import FastMCP
import httpx
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Optional, Any

# Load environment variables
load_dotenv()

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


# ----- Tools -----

@mcp.tool()
async def get_weather(city: str) -> str:
    """
    Get the current weather for a city.

    Divines the atmospheric conditions in any city across the planes.
    Results are cached for 5 minutes to respect API limits.

    Args:
        city: Name of the city (e.g., "London", "Tokyo", "New York")

    Returns:
        Formatted weather report with current conditions.
    """
    # ... (full implementation as above)


@mcp.tool()
async def get_news(topic: str, count: int = 5) -> str:
    """
    Get the latest news headlines on a topic.

    Scries the chronicles of the realm for recent news and events.
    Results are cached for 10 minutes.

    Args:
        topic: The topic to search for (e.g., "technology", "climate")
        count: Number of headlines to return (default 5, max 10)

    Returns:
        Formatted list of news headlines with sources.
    """
    # ... (full implementation as above)


if __name__ == "__main__":
    mcp.run()
```

---

## Testing the Multi-Tool Server

Launch the Inspector:

```bash
npx @modelcontextprotocol/inspector uv run python server.py
```

### Test Weather Caching
1. Call `get_weather("London")`
2. Call `get_weather("London")` again immediately
3. Second call should show "[Cached response]" and be faster

### Test News
1. Call `get_news("technology")`
2. Verify headlines are returned
3. Call again to test caching

---

## Validation Requirements

Your code must have:

- [ ] Two or more `@mcp.tool()` functions
- [ ] Both tools use `async def`
- [ ] Caching system with:
  - `get_cached()` function
  - `set_cached()` function
  - TTL (time-to-live) expiration
- [ ] Error handling for rate limits (429 status)
- [ ] Docstrings on all functions

---

## Understanding the Cache Flow

```
Request: get_weather("London")
          │
          ▼
    ┌─────────────┐
    │ Check Cache │
    └─────────────┘
          │
    ┌─────┴─────┐
    │           │
  Found     Not Found
    │           │
    ▼           ▼
 Return     Call API
 Cached         │
              ▼
         ┌──────────┐
         │ Store in │
         │  Cache   │
         └──────────┘
              │
              ▼
          Return
          Result
```

---

## Cache Strategies

Our simple cache works for development, but production might need:

### Redis (Remote Cache)
```python
import redis

cache = redis.Redis()

def get_cached(key: str) -> Optional[str]:
    return cache.get(key)

def set_cached(key: str, value: str, ttl: int = 300):
    cache.setex(key, ttl, value)
```

### Size-Limited Cache (LRU)
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_weather(city: str) -> str:
    # Note: LRU doesn't have TTL, needs different approach
    ...
```

For our tutorial, the simple in-memory cache is sufficient.

---

## What's Next?

Your Aether Conduit is complete with two powerful tools and intelligent caching. In Phase 5, you'll test the full server and connect it to Claude Desktop.

*"Two spells mastered, working in harmony. The Conduit is ready."*

---

**Phase Complete!**

You've built a multi-tool MCP server with caching. Proceed to Phase 5 to test and deploy.
