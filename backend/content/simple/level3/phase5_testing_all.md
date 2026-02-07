# Testing Everything

Your API server now has two tools -- weather and news -- both with caching. Let's test everything and connect it to Claude Desktop.

## Complete Server Overview

Your `server.py` should have:
- Imports: `fastmcp`, `httpx`, `os`, `time`, `dotenv`
- A `FastMCP` server instance
- API keys loaded from `.env`
- A simple caching system (`get_cached` and `set_cached`)
- `get_weather` tool with caching
- `get_news` tool with caching

## Test with the Inspector

Start the Inspector:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

Run through these checks:

**Weather tool:**
1. Search for "London" -- you should see temperature, conditions, and humidity
2. Search for "London" again -- you should see the same result with "(Cached result)" at the end
3. Search for a made-up city like "Xyzzyville" -- you should see a "City not found" message

**News tool:**
1. Search for "technology" -- you should see 5 headlines
2. Try with `count` set to 3 -- you should see only 3 headlines
3. Search for "technology" with count 3 again -- you should see "(Cached result)"

## Common Issues

**"Error: API key is not configured"** -- Your `.env` file is missing or the key names do not match. Make sure the file is in the same folder as `server.py`.

**Weather returns an error code** -- New OpenWeatherMap keys take up to 2 hours to activate. Wait and try again.

**News returns empty results** -- Try a broader topic like "technology" or "sports" instead of something very specific.

## Connect to Claude Desktop

Update your Claude Desktop config:

```json
{
  "mcpServers": {
    "api-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/full/path/to/api-server"
    }
  }
}
```

Restart Claude Desktop and try:

- "What is the weather in Tokyo right now?"
- "What are the latest news headlines about artificial intelligence?"
- "Compare the weather in London and Sydney"

Claude will use your tools automatically, calling `get_weather` and `get_news` as needed.

## What You Learned

In this level, you learned how to connect your MCP server to external APIs, make async web requests with httpx, handle errors from API calls, implement caching to reduce API usage, and manage API keys securely with environment variables. These patterns form the foundation for building any API-connected tool.

In the final level, you will learn how to deploy your server to the cloud so it can be accessed from anywhere.
