# Phase 3: The Weather Divination

*"To know the skies of distant lands is to hold power over the elements themselves."*

---

## Creating the Weather Tool

Now we'll create an async tool that fetches weather data from OpenWeatherMap. This is your first true API-connected MCP tool.

---

## The Weather API

OpenWeatherMap's Current Weather API returns data like:

```json
{
  "name": "London",
  "main": {
    "temp": 15.2,
    "feels_like": 14.1,
    "humidity": 72
  },
  "weather": [
    {
      "main": "Clouds",
      "description": "scattered clouds"
    }
  ],
  "wind": {
    "speed": 4.5
  }
}
```

We'll transform this into a human-readable format for Claude.

---

## The Weather Tool Implementation

Open `server.py` and add the weather tool:

```python
from fastmcp import FastMCP
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create the server
mcp = FastMCP("Aether Conduit")

# API Configuration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"


@mcp.tool()
async def get_weather(city: str) -> str:
    """
    Get the current weather for a city.

    Divines the atmospheric conditions in any city across the planes,
    returning temperature, conditions, humidity, and wind information.

    Args:
        city: Name of the city (e.g., "London", "Tokyo", "New York")

    Returns:
        Formatted weather report with current conditions.

    Examples:
        - "London" returns current weather in London, UK
        - "Tokyo" returns current weather in Tokyo, Japan
        - "New York" returns current weather in New York, USA
    """
    if not OPENWEATHER_API_KEY:
        return "Weather divination unavailable: No API key configured."

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

        # Handle specific error cases
        if response.status_code == 404:
            return f"City '{city}' not found. Please check the spelling or try a different city name."

        if response.status_code == 401:
            return "Weather divination failed: Invalid API key."

        if response.status_code == 429:
            return "Weather divination rate limit exceeded. Please try again later."

        response.raise_for_status()
        data = response.json()

        # Extract weather information
        name = data.get("name", city)
        country = data.get("sys", {}).get("country", "")
        temp = data.get("main", {}).get("temp", "N/A")
        feels_like = data.get("main", {}).get("feels_like", "N/A")
        humidity = data.get("main", {}).get("humidity", "N/A")
        wind_speed = data.get("wind", {}).get("speed", "N/A")

        weather_list = data.get("weather", [])
        if weather_list:
            condition = weather_list[0].get("main", "Unknown")
            description = weather_list[0].get("description", "")
        else:
            condition = "Unknown"
            description = ""

        # Format the response
        return f"""# Weather in {name}, {country}

**Condition:** {condition} ({description})
**Temperature:** {temp}°C (feels like {feels_like}°C)
**Humidity:** {humidity}%
**Wind Speed:** {wind_speed} m/s
"""

    except httpx.TimeoutException:
        return "Weather divination timed out. The planes are turbulent. Please try again."

    except httpx.HTTPStatusError as e:
        return f"Weather divination failed: HTTP error {e.response.status_code}"

    except Exception as e:
        return f"Weather divination encountered an unexpected error: {str(e)}"


if __name__ == "__main__":
    mcp.run()
```

---

## Understanding the Implementation

### Async HTTP Client

```python
async with httpx.AsyncClient() as client:
    response = await client.get(...)
```

We use `async with` to create a client that's properly cleaned up after use. The `await` makes the HTTP request without blocking.

### Error Handling Layers

1. **Missing API Key**
   ```python
   if not OPENWEATHER_API_KEY:
       return "Weather divination unavailable..."
   ```

2. **Specific HTTP Errors**
   ```python
   if response.status_code == 404:
       return f"City '{city}' not found..."
   ```

3. **General HTTP Errors**
   ```python
   response.raise_for_status()
   ```

4. **Timeout Handling**
   ```python
   except httpx.TimeoutException:
       return "Weather divination timed out..."
   ```

5. **Catch-All**
   ```python
   except Exception as e:
       return f"Unexpected error: {str(e)}"
   ```

### Data Extraction

We safely extract nested data with defaults:

```python
temp = data.get("main", {}).get("temp", "N/A")
```

This pattern:
- Gets "main" from data (or empty dict if missing)
- Gets "temp" from main (or "N/A" if missing)

---

## Testing with the Inspector

Launch the Inspector:

```bash
npx @modelcontextprotocol/inspector uv run python server.py
```

In the Tools tab:
1. Find `get_weather`
2. Enter a city name (e.g., "London")
3. Click "Run"

Expected output:
```
# Weather in London, GB

**Condition:** Clouds (scattered clouds)
**Temperature:** 15.2°C (feels like 14.1°C)
**Humidity:** 72%
**Wind Speed:** 4.5 m/s
```

### Test Error Cases

Try:
- `"Nonexistent City"` → Should return "City not found"
- `"Tokyo"` → Should return valid weather

---

## Validation Requirements

Your code must have:

- [ ] `async def` function (not just `def`)
- [ ] `httpx.AsyncClient()` with `async with` context manager
- [ ] `await` for the HTTP request
- [ ] Comprehensive docstring with examples
- [ ] Error handling for:
  - Missing API key
  - 404 (city not found)
  - Timeout
  - General errors

---

## Adding Weather Icons (Optional Enhancement)

You can enhance the output with weather-appropriate symbols:

```python
WEATHER_ICONS = {
    "Clear": "☀️",
    "Clouds": "☁️",
    "Rain": "🌧️",
    "Drizzle": "🌦️",
    "Thunderstorm": "⛈️",
    "Snow": "❄️",
    "Mist": "🌫️",
    "Fog": "🌫️",
}

def get_weather_icon(condition: str) -> str:
    return WEATHER_ICONS.get(condition, "🌡️")
```

Then use it in your response:
```python
icon = get_weather_icon(condition)
return f"""# {icon} Weather in {name}, {country}
...
"""
```

---

## Common Mistakes to Avoid

### 1. Forgetting async/await
```python
# Wrong - not async
def get_weather(city: str) -> str:
    response = httpx.get(...)  # This blocks!

# Correct - async
async def get_weather(city: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.get(...)
```

### 2. Not Using Context Manager
```python
# Wrong - client not properly closed
client = httpx.AsyncClient()
response = await client.get(...)

# Correct - client is closed after use
async with httpx.AsyncClient() as client:
    response = await client.get(...)
```

### 3. Missing Timeout
```python
# Dangerous - could hang forever
response = await client.get(url)

# Safe - times out after 10 seconds
response = await client.get(url, timeout=10.0)
```

### 4. Exposing API Key in Errors
```python
# Wrong - leaks API key
return f"Failed with URL: {url}?appid={API_KEY}"

# Correct - hide sensitive data
return "Weather divination failed. Please check configuration."
```

---

## The Power of Async

With async tools, your server can:
- Handle multiple weather requests concurrently
- Not block while waiting for API responses
- Scale efficiently with many users

This is why we call async tools **Instants** in MTG terms—they resolve without holding up the game.

---

## What's Next?

You've created a single API tool. In Phase 4, you'll add a second tool (news headlines) and implement **caching**—a Memory Stone that remembers recent responses to reduce API calls.

*"One spell mastered. Now we add another, and teach them to remember."*

---

**Phase Complete!**

You've created an async API-connected tool. Proceed to Phase 4 to add news and caching.
