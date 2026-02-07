# Adding News and Caching

Now let's add a second tool for news headlines. We will also add **caching** to avoid making too many API requests.

## Why Caching?

Free API plans usually have limits -- for example, 1,000 requests per day. If Claude calls your weather tool every time someone mentions the weather, you could hit that limit quickly. Caching means saving a result for a short time and reusing it instead of making a new API request.

## Adding the Cache

Add this near the top of your `server.py`, after the imports:

```python
import time

# Simple cache: stores results with a timestamp
_cache = {}
CACHE_TTL = 300  # Cache results for 5 minutes (300 seconds)

def get_cached(key: str):
    """Return cached data if it exists and is not expired."""
    if key in _cache:
        data, timestamp = _cache[key]
        if time.time() - timestamp < CACHE_TTL:
            return data
    return None

def set_cached(key: str, data):
    """Store data in the cache with the current timestamp."""
    _cache[key] = (data, time.time())
```

## The News Tool

Add this below your weather tool:

```python
@mcp.tool()
async def get_news(topic: str, count: int = 5) -> str:
    """Get recent news headlines about a topic. Returns up to 'count' headlines (default 5)."""
    if not NEWS_KEY:
        return "Error: News API key is not configured. Check your .env file."

    cache_key = f"news:{topic}:{count}"
    cached = get_cached(cache_key)
    if cached:
        return cached + "\n(Cached result)"

    url = "https://newsapi.org/v2/everything"
    params = {
        "q": topic,
        "pageSize": count,
        "sortBy": "publishedAt",
        "apiKey": NEWS_KEY
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code != 200:
        return f"Error fetching news: {response.status_code}"

    data = response.json()
    articles = data.get("articles", [])

    if not articles:
        return f"No news articles found for '{topic}'."

    lines = [f"Top {len(articles)} headlines about '{topic}':"]
    for i, article in enumerate(articles, 1):
        title = article.get("title", "No title")
        source = article.get("source", {}).get("name", "Unknown")
        lines.append(f"  {i}. {title} ({source})")

    result = "\n".join(lines)
    set_cached(cache_key, result)
    return result
```

## Update the Weather Tool With Caching

Go back to your `get_weather` function and add caching there too. Add these lines right after the API key check:

```python
    cache_key = f"weather:{city.lower()}"
    cached = get_cached(cache_key)
    if cached:
        return cached + "\n(Cached result)"
```

And at the end of the function, just before the `return` statement, add:

```python
    result = (
        f"Weather in {city}:\n"
        f"  Temperature: {temp}°C (feels like {feels_like}°C)\n"
        f"  Conditions: {description}\n"
        f"  Humidity: {humidity}%"
    )
    set_cached(cache_key, result)
    return result
```

## How the Cache Works

1. Before making an API request, check if we have a recent result for the same query
2. If we do, return it immediately (no API call needed)
3. If we do not, make the API call and save the result for next time
4. Results expire after 5 minutes, so data stays reasonably fresh

This simple approach saves API calls while keeping your data up to date.
