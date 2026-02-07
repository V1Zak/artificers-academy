# End-to-End Validation

## Multi-Tool Server Testing

Your server now exposes two tools (`get_weather` and `get_forecast`) with async HTTP integration and TTL caching. This phase covers comprehensive validation of the complete system.

## Inspector Validation

Launch the Inspector:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

### Tool Discovery Test

Open the **Tools** tab. Verify both tools are listed:

1. `get_weather` with parameter `city` (required, string)
2. `get_forecast` with parameters `city` (required, string) and `days` (optional, integer, default 3)

Confirm the JSON Schema for each tool includes the description from the docstring.

### Functional Tests

Execute the following test cases:

| Test | Tool | Input | Expected |
|------|------|-------|----------|
| Valid city | `get_weather` | `city: "London"` | Weather data for London, GB |
| Invalid city | `get_weather` | `city: "Xyzzyville"` | Error: City not found |
| Cache hit | `get_weather` | `city: "London"` (repeat) | Response with `[Cached]` prefix |
| Default forecast | `get_forecast` | `city: "Tokyo"` | 3-day forecast |
| Custom forecast | `get_forecast` | `city: "Tokyo", days: 1` | 1-day forecast |
| Max days | `get_forecast` | `city: "Berlin", days: 10` | Clamped to 5-day forecast |

### Error Simulation

Test error handling by temporarily modifying the API key:

```python
# Temporarily set an invalid key to test 401 handling
OPENWEATHER_API_KEY = "invalid_key"
```

Run a tool call and verify the error message is clear and actionable. Restore the valid key after testing.

## Message Log Analysis

In the Inspector's message log, examine the JSON-RPC exchange for a `get_weather` call:

```json
// Client request
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": { "city": "Seattle" }
  }
}

// Server response
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "text",
      "text": "Weather for Seattle, US:\n  Temperature: 55.4°F\n..."
    }]
  }
}
```

Verify that:
- The `id` fields match between request and response.
- The `result.content` array contains a text block.
- No sensitive data (API keys) appears in the response.

## Claude Desktop Integration

Register the server:

```json
{
  "mcpServers": {
    "api-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/absolute/path/to/mcp-api-server",
      "env": {
        "OPENWEATHER_API_KEY": "your_key_here"
      }
    }
  }
}
```

Restart Claude Desktop and test with natural language prompts:

- "What's the weather in San Francisco right now?"
- "Give me a 5-day forecast for Berlin."
- "Compare the weather in Tokyo and London."

For the comparison prompt, observe that Claude invokes `get_weather` twice (once for each city) and synthesizes the results into a comparison.

## Performance Verification

Test the caching behavior through Claude Desktop:
1. Ask for weather in a city.
2. Immediately ask again for the same city.
3. The second response should be noticeably faster (cache hit).

## Production Checklist

Before considering this server production-ready, verify:

- [ ] All tools have comprehensive docstrings
- [ ] Error messages are user-readable (no raw HTTP errors)
- [ ] API keys are loaded from environment variables, not hard-coded
- [ ] Timeouts are configured on all HTTP requests
- [ ] Cache TTL is appropriate for the data freshness requirements
- [ ] `.env` is in `.gitignore`

## Module 3 Complete

You have built a multi-tool MCP server with async HTTP integration, response caching, and comprehensive error handling. Module 4 covers deploying this server to production with Docker and Railway.
