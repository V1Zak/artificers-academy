# External API Patterns

## Why External APIs?

The MCP servers built so far operate on local data: fetching cards from Scryfall and reading filesystem content. Production MCP servers frequently integrate with third-party APIs to give LLMs access to live, external data: weather services, news feeds, databases, SaaS platforms, and more.

This module covers the patterns and pitfalls of integrating external HTTP APIs into MCP tools.

## Integration Architecture

When an MCP tool calls an external API, the data flow is:

```
LLM → MCP Client → MCP Server → External API
                                      ↓
LLM ← MCP Client ← MCP Server ← API Response
```

The MCP server acts as a bridge between the LLM and the external service. This architecture provides several benefits:

- **Credential isolation**: API keys stay on the server; the LLM never sees them.
- **Response transformation**: Raw API responses are reformatted into LLM-friendly text.
- **Rate limit management**: The server controls request frequency.
- **Error translation**: HTTP errors are converted to user-readable messages.

## Common Patterns

### 1. Authentication Management

API keys should be loaded from environment variables, never hard-coded:

```python
import os

API_KEY = os.getenv("WEATHER_API_KEY")
if not API_KEY:
    raise ValueError("WEATHER_API_KEY environment variable is required")
```

For local development, use a `.env` file with `python-dotenv`:

```python
from dotenv import load_dotenv
load_dotenv()  # Reads .env file into os.environ
```

### 2. Response Transformation

External APIs return JSON with fields the LLM does not need. Transform responses into concise, relevant text:

```python
# Raw API response has 50+ fields
data = response.json()

# Extract only what the LLM needs
return f"Temperature: {data['main']['temp']}°F\nConditions: {data['weather'][0]['description']}"
```

### 3. Error Propagation

Map HTTP status codes to informative error messages:

```python
if response.status_code == 401:
    return "Error: Invalid API key. Check server configuration."
elif response.status_code == 404:
    return f"Error: No data found for '{query}'."
elif response.status_code == 429:
    return "Error: Rate limit exceeded. Try again in a few minutes."
elif response.status_code >= 500:
    return "Error: External service is temporarily unavailable."
```

### 4. Rate Limiting

Respect API rate limits. Common strategies:

- **Client-side throttling**: Limit requests per time window using a token bucket or sliding window counter.
- **Caching**: Store responses to avoid redundant API calls (covered in Phase 4).
- **Backoff**: Implement exponential backoff for 429 responses.

### 5. Timeout Configuration

Always set timeouts on HTTP requests. An unresponsive API should not block the MCP server indefinitely:

```python
async with httpx.AsyncClient(timeout=10.0) as client:
    response = await client.get(url)
```

The default `httpx` timeout is 5 seconds. Adjust based on the API's expected response time.

## Async vs Sync

MCP tool handlers should be `async` when performing I/O operations. The `async`/`await` pattern allows the server to remain responsive while waiting for API responses. FastMCP supports both sync and async tool handlers, but async is strongly recommended for any tool that makes network requests.

```python
# Preferred: async tool with await
@mcp.tool()
async def get_weather(city: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

# Avoid: sync tool blocks the event loop
@mcp.tool()
def get_weather(city: str) -> str:
    response = httpx.get(url)  # Blocks!
```

## Security Considerations

- Never expose API keys in tool responses
- Validate and sanitize user input before passing to API parameters
- Use HTTPS exclusively for API communication
- Log API errors for debugging but redact sensitive data from logs

## What You Will Build

In this module, you will build a multi-tool MCP server that integrates with a weather API and implements async HTTP patterns, response caching, and comprehensive error handling.
