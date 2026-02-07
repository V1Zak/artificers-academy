# Response Caching

## Why Cache API Responses?

External API calls introduce latency and are subject to rate limits. Weather data for a given city does not change significantly within a few minutes. By caching responses, you:

- **Reduce latency**: Cached responses are returned instantly.
- **Avoid rate limits**: Fewer API calls mean less risk of hitting quotas.
- **Improve reliability**: Cached data can be served even if the API is temporarily down.

## Implementing a TTL Cache

Add a time-based in-memory cache to the server:

```python
# server.py
import os
import time
import httpx
from dotenv import load_dotenv
from fastmcp import FastMCP

load_dotenv()

mcp = FastMCP("API Server")

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not OPENWEATHER_API_KEY:
    raise ValueError("OPENWEATHER_API_KEY is not set.")

OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

# TTL cache: stores (response_text, expiry_timestamp) keyed by city name.
# Cache entries expire after CACHE_TTL seconds.
CACHE_TTL = 300  # 5 minutes
_cache: dict[str, tuple[str, float]] = {}


def get_cached(key: str) -> str | None:
    """Return cached value if it exists and has not expired."""
    if key in _cache:
        value, expiry = _cache[key]
        if time.time() < expiry:
            return value
        # Expired entry: remove it
        del _cache[key]
    return None


def set_cache(key: str, value: str) -> None:
    """Store a value in the cache with TTL expiration."""
    _cache[key] = (value, time.time() + CACHE_TTL)
```

## Integrating the Cache into the Tool

Update `get_weather` to check the cache before making an API call:

```python
@mcp.tool()
async def get_weather(city: str) -> str:
    """Get current weather conditions for a city.

    Results are cached for 5 minutes to reduce API usage.
    Subsequent requests for the same city within the TTL
    return the cached response without an API call.

    Args:
        city: The city name (e.g., 'Seattle' or 'London,UK').

    Returns:
        Formatted weather report as a text string.
    """
    # Normalize the cache key to handle case variations
    cache_key = city.strip().lower()

    # Check cache first
    cached = get_cached(cache_key)
    if cached is not None:
        return f"[Cached] {cached}"

    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY,
        "units": "imperial"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(OPENWEATHER_BASE_URL, params=params)

    if response.status_code == 404:
        return f"Error: City '{city}' not found."
    elif response.status_code != 200:
        return f"Error: API returned status {response.status_code}."

    data = response.json()

    result = (
        f"Weather for {data['name']}, {data['sys']['country']}:\n"
        f"  Temperature: {data['main']['temp']}°F\n"
        f"  Feels Like: {data['main']['feels_like']}°F\n"
        f"  Humidity: {data['main']['humidity']}%\n"
        f"  Conditions: {data['weather'][0]['description'].title()}\n"
        f"  Wind: {data['wind']['speed']} mph"
    )

    # Store in cache
    set_cache(cache_key, result)

    return result
```

## Cache Key Normalization

The cache key is normalized with `.strip().lower()` to ensure "Seattle", "seattle", and " Seattle " all resolve to the same cache entry. Without normalization, minor input variations would bypass the cache.

## Adding a Second Tool

Extend the server with a forecast tool that also uses caching:

```python
FORECAST_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"

@mcp.tool()
async def get_forecast(city: str, days: int = 3) -> str:
    """Get a multi-day weather forecast for a city.

    Returns forecast data in 3-hour intervals for the specified
    number of days (max 5). Results are cached for 15 minutes.

    Args:
        city: The city name.
        days: Number of days to forecast (1-5, default 3).

    Returns:
        Formatted forecast as a text string.
    """
    days = max(1, min(days, 5))  # Clamp to valid range
    cache_key = f"forecast:{city.strip().lower()}:{days}"

    cached = get_cached(cache_key)
    if cached is not None:
        return f"[Cached] {cached}"

    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY,
        "units": "imperial",
        "cnt": days * 8  # 8 intervals per day (3-hour intervals)
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(FORECAST_BASE_URL, params=params)

    if response.status_code != 200:
        return f"Error: Could not fetch forecast (HTTP {response.status_code})."

    data = response.json()
    lines = [f"Forecast for {data['city']['name']}:"]

    for entry in data["list"][:days * 2]:  # Sample 2 per day
        dt = entry["dt_txt"]
        temp = entry["main"]["temp"]
        desc = entry["weather"][0]["description"].title()
        lines.append(f"  {dt}: {temp}°F, {desc}")

    result = "\n".join(lines)
    set_cache(cache_key, result)
    return result
```

## Cache Limitations

This in-memory cache has known limitations:

- **No persistence**: Cache is lost when the server restarts.
- **No size limit**: A large number of unique queries could consume excessive memory.
- **No distributed sharing**: Each server instance has its own cache.

For production systems, consider Redis or `cachetools` with LRU eviction:

```python
from cachetools import TTLCache
_cache = TTLCache(maxsize=1000, ttl=300)
```

## Testing the Cache

In the Inspector, call `get_weather` for the same city twice. The second response should include the `[Cached]` prefix, confirming the cache hit. Wait 5 minutes and try again to verify cache expiration.
