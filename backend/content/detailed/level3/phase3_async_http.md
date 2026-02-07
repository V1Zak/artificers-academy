# Async HTTP with httpx

## Implementing an Async MCP Tool

Add a weather tool that queries the OpenWeatherMap API using `httpx.AsyncClient`:

```python
# server.py
import os
import httpx
from dotenv import load_dotenv
from fastmcp import FastMCP

load_dotenv()

mcp = FastMCP("API Server")

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not OPENWEATHER_API_KEY:
    raise ValueError("OPENWEATHER_API_KEY is not set.")

OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

@mcp.tool()
async def get_weather(city: str) -> str:
    """Get current weather conditions for a city.

    Queries the OpenWeatherMap API for real-time weather data
    including temperature, humidity, wind speed, and conditions.

    Args:
        city: The city name to look up (e.g., 'Seattle' or 'London,UK').

    Returns:
        Formatted weather report as a text string.
    """
    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY,
        "units": "imperial"  # Fahrenheit; use "metric" for Celsius
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(OPENWEATHER_BASE_URL, params=params)

    if response.status_code == 401:
        return "Error: Invalid API key. Verify OPENWEATHER_API_KEY configuration."
    elif response.status_code == 404:
        return f"Error: City '{city}' not found. Check the spelling or try 'City,CountryCode' format."
    elif response.status_code != 200:
        return f"Error: API returned status {response.status_code}."

    data = response.json()

    return (
        f"Weather for {data['name']}, {data['sys']['country']}:\n"
        f"  Temperature: {data['main']['temp']}°F\n"
        f"  Feels Like: {data['main']['feels_like']}°F\n"
        f"  Humidity: {data['main']['humidity']}%\n"
        f"  Conditions: {data['weather'][0]['description'].title()}\n"
        f"  Wind: {data['wind']['speed']} mph"
    )

if __name__ == "__main__":
    mcp.run()
```

## Understanding the Async Flow

When the LLM invokes `get_weather`, the following sequence occurs:

1. FastMCP receives a `tools/call` JSON-RPC request on stdin.
2. It matches the tool name and validates arguments against the schema.
3. The `async def get_weather()` coroutine is awaited.
4. `httpx.AsyncClient()` opens a connection pool (context manager ensures cleanup).
5. `await client.get()` sends the HTTP request and yields control until the response arrives.
6. The response is parsed and formatted.
7. FastMCP wraps the return value in a JSON-RPC response and writes it to stdout.

## httpx.AsyncClient Lifecycle

The `async with` statement manages the client's connection pool:

```python
# Creates a new client per request (simple but suboptimal)
async with httpx.AsyncClient(timeout=10.0) as client:
    response = await client.get(url)
# Client is closed here, connections are released
```

For servers making frequent API calls, consider a module-level client:

```python
# Reusable client (connection pooling across requests)
http_client = httpx.AsyncClient(timeout=10.0)

@mcp.tool()
async def get_weather(city: str) -> str:
    response = await http_client.get(url, params=params)
    # ...
```

The trade-off: a module-level client is more efficient but requires explicit cleanup. For most MCP servers, per-request clients are sufficient.

## Timeout Configuration

The `timeout=10.0` parameter sets a 10-second timeout for the entire request (connection + read). Configure timeouts based on the API's expected latency:

```python
# Fine-grained timeout control
timeout = httpx.Timeout(
    connect=5.0,   # Time to establish connection
    read=10.0,     # Time to receive response
    write=5.0,     # Time to send request
    pool=5.0       # Time to acquire connection from pool
)
async with httpx.AsyncClient(timeout=timeout) as client:
    response = await client.get(url)
```

## Error Handling Strategy

The implementation maps HTTP status codes to user-readable messages. This is essential because:

- The LLM receives the return value as context for its response
- Raw HTTP errors ("401 Unauthorized") are unhelpful for end users
- The LLM can relay actionable error messages naturally

## Testing with the Inspector

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

Test with several cities: a valid city, a misspelled city, and a city with country code (e.g., "Paris,FR"). Verify that each case produces the expected output or error message.
