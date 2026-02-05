# Phase 1: Planar Bridges

*"To know the weather in distant lands, one must build bridges across the planes."*

---

## Beyond Local Knowledge

In Level 1, you built Tools that called external APIs (Scryfall). In Level 2, you created Resources that accessed local files. Now we combine these concepts: **building MCP servers that channel knowledge from across the Aether**—the realm of external APIs.

---

## Why External APIs Through MCP?

You might wonder: "Claude can already access the internet. Why wrap APIs in MCP?"

The answer lies in **control, context, and capability**:

### 1. Control
- **API Keys Stay Safe** - Keys live in your environment, not in prompts
- **Rate Limiting** - You control how often APIs are called
- **Filtering** - Expose only the data you want Claude to see

### 2. Context
- **Specialized Knowledge** - Claude knows exactly what data is available
- **Structured Responses** - Format API data for optimal AI consumption
- **Error Translation** - Convert cryptic API errors into helpful messages

### 3. Capability
- **Private APIs** - Access internal services Claude can't reach
- **Combined Data** - Merge multiple API sources into coherent responses
- **Caching** - Reduce costs and improve response times

---

## The Aetheric Conduit

Think of your MCP server as a **Planar Bridge**—a safe conduit connecting Claude to external services:

```
┌─────────────┐     ┌─────────────────┐     ┌────────────────┐
│   Claude    │ ←→  │  Your MCP       │ ←→  │  External API  │
│   Desktop   │     │  Server         │     │  (Weather,     │
│             │     │  (Planar Bridge)│     │   News, etc.)  │
└─────────────┘     └─────────────────┘     └────────────────┘
                           ↓
                    ┌──────────────┐
                    │  Your API    │
                    │  Keys (.env) │
                    └──────────────┘
```

The bridge:
- Receives requests from Claude
- Authenticates with external APIs using your keys
- Transforms and returns the data

---

## Key Concepts for API Integration

### HTTP Clients

We use `httpx` for making API calls:
- **Async-first** - Built for modern Python async/await
- **Familiar** - Similar API to the popular `requests` library
- **Robust** - Built-in timeout, retry, and error handling

```python
import httpx

async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()
```

### Environment Variables

API keys should **never** be in your code. Use environment variables:

```python
import os

API_KEY = os.getenv("WEATHER_API_KEY")
if not API_KEY:
    raise ValueError("WEATHER_API_KEY environment variable is required")
```

Store keys in a `.env` file (never commit this!):
```
WEATHER_API_KEY=abc123xyz
NEWS_API_KEY=def456uvw
```

### Rate Limiting

Most APIs limit how many requests you can make:
- Free tiers: Often 60-1000 requests/day
- Respect limits to avoid getting banned
- Implement caching to reduce calls

### Error Handling

External APIs can fail in many ways:
- Network timeouts
- Rate limit exceeded
- Invalid API key
- Service unavailable

Always handle errors gracefully!

---

## The Server We'll Build

In this level, you'll create an **Aether Conduit** server with:

1. **Weather Divination** - Current weather from OpenWeatherMap
2. **Chronicle Scrying** - News headlines from a news API
3. **Intelligent Caching** - Reduce API calls and costs

The final server provides two powerful tools:

```python
@mcp.tool()
async def get_weather(city: str) -> str:
    """Get current weather for a city."""
    ...

@mcp.tool()
async def get_news(topic: str) -> str:
    """Get latest news headlines on a topic."""
    ...
```

---

## Async/Await: The Instant Speed

All our API calls will use `async/await`. This is crucial for:

1. **Non-Blocking** - Other operations can proceed while waiting for APIs
2. **Efficiency** - Handle multiple requests concurrently
3. **MCP Compatibility** - FastMCP fully supports async tools

```python
# Synchronous (blocks while waiting)
response = httpx.get("https://api.example.com")

# Asynchronous (doesn't block)
async with httpx.AsyncClient() as client:
    response = await client.get("https://api.example.com")
```

Think of sync as a Sorcery (must wait for resolution) and async as an Instant (resolves without stopping the game).

---

## API Selection for This Tutorial

We'll use free APIs that don't require credit cards:

### OpenWeatherMap
- **Purpose:** Current weather data
- **Free tier:** 1,000 calls/day
- **Signup:** https://openweathermap.org/api

### NewsAPI (or alternative)
- **Purpose:** News headlines
- **Free tier:** 100 requests/day (development only)
- **Signup:** https://newsapi.org/

> **Note:** NewsAPI's free tier only works for development. For production, consider alternatives like GNews or RSS feeds.

---

## Security: Protecting Your Keys

API keys are like mana—valuable and dangerous if stolen.

### Do:
- Store keys in environment variables
- Use `.env` files locally
- Add `.env` to `.gitignore`
- Use secrets managers in production

### Don't:
- Hardcode keys in source code
- Commit keys to git
- Share keys in chat/email
- Log keys in output

---

## Key Concepts to Remember

| Concept | MTG Metaphor | Description |
|---------|--------------|-------------|
| External API | Distant Plane | Remote service with valuable data |
| httpx | Planar Gate | Library for making HTTP requests |
| API Key | Summoning Seal | Authentication token for API access |
| Rate Limit | Mana Pool | Maximum requests in a time period |
| Caching | Memory Stone | Store responses to avoid repeated calls |
| Async/Await | Instant Speed | Non-blocking operations |

---

## Prerequisites

Before starting Phase 2, you'll need:

1. **OpenWeatherMap Account**
   - Sign up at https://openweathermap.org/api
   - Get your free API key
   - Note: Keys may take a few hours to activate

2. **NewsAPI Account** (optional)
   - Sign up at https://newsapi.org/
   - Get your free API key
   - We'll provide an alternative if you skip this

3. **Completed Levels 1 & 2**
   - Understanding of FastMCP tools and resources
   - Familiarity with async Python

---

## What's Next?

In Phase 2, you'll set up your Aether Conduit project, configure your API keys, and prepare the foundation for reaching across the planes.

*"The bridges are designed. Now we must gather the materials."*

---

**Phase Complete!**

You understand why and how we connect MCP servers to external APIs. Proceed to Phase 2 to set up your Aether Conduit project.
