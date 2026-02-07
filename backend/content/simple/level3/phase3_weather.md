# Fetching Weather Data

Time to build your first API-connected tool. This one will fetch current weather for any city in the world.

## The Weather Tool

Add this to your `server.py`, below the existing code:

```python
import httpx

@mcp.tool()
async def get_weather(city: str) -> str:
    """Get the current weather for a city. Returns temperature, conditions, and humidity."""
    if not WEATHER_KEY:
        return "Error: Weather API key is not configured. Check your .env file."

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": WEATHER_KEY,
        "units": "metric"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code == 404:
        return f"City not found: {city}. Check the spelling and try again."

    if response.status_code != 200:
        return f"Error fetching weather: {response.status_code}"

    data = response.json()
    temp = data["main"]["temp"]
    feels_like = data["main"]["feels_like"]
    humidity = data["main"]["humidity"]
    description = data["weather"][0]["description"]

    return (
        f"Weather in {city}:\n"
        f"  Temperature: {temp}°C (feels like {feels_like}°C)\n"
        f"  Conditions: {description}\n"
        f"  Humidity: {humidity}%"
    )
```

## Breaking It Down

**`async def get_weather`** -- The `async` keyword means this function can pause while waiting for the API to respond, letting the server handle other requests in the meantime.

**`if not WEATHER_KEY`** -- Always check that the API key exists before making a request. This gives a helpful error message instead of a confusing crash.

**`httpx.AsyncClient()`** -- This creates a web client that can make requests. The `async with` pattern ensures the client is properly closed when we are done.

**`await client.get(url, params=params)`** -- This sends a GET request to the weather API and waits for the response. The `params` dictionary is converted into URL parameters automatically.

**`response.status_code`** -- Every API response includes a status code. `200` means success, `404` means not found, and other codes indicate various errors.

**`response.json()`** -- Converts the API's response from raw text into a Python dictionary so we can easily access individual fields.

## Error Handling

Notice that we handle multiple error cases:
- Missing API key
- City not found (404)
- Any other API error

Good error handling is important. Without it, your tool would crash with a confusing error message, and the AI would not know what went wrong.

## Test It

Run your server to check for syntax errors:

```bash
uv run server.py
```

Then use the Inspector to test:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

Try the `get_weather` tool with cities like "London", "Tokyo", or "New York".
