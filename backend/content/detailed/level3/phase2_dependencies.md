# Dependency Configuration

## Project Initialization

Create the new project and install dependencies:

```bash
mkdir mcp-api-server
cd mcp-api-server
uv init
uv add "fastmcp[cli]" httpx python-dotenv
```

This installs three packages:

| Package | Purpose |
|---------|---------|
| `fastmcp[cli]` | MCP server framework with CLI tooling |
| `httpx` | Async-capable HTTP client (replaces `requests`) |
| `python-dotenv` | Loads `.env` files into environment variables |

## Why httpx Over requests?

The `requests` library is synchronous. Calling `requests.get()` inside an `async def` tool handler blocks the event loop, preventing the server from processing other messages. `httpx` provides a native async API via `httpx.AsyncClient`:

```python
# httpx async usage
async with httpx.AsyncClient() as client:
    response = await client.get("https://api.example.com/data")
```

`httpx` is API-compatible with `requests` for common operations, so migration is straightforward.

## Environment Variable Configuration

Create a `.env` file in the project root:

```bash
# .env
OPENWEATHER_API_KEY=your_api_key_here
```

To obtain a free API key:
1. Register at https://openweathermap.org/api
2. Navigate to "API keys" in your account dashboard
3. Copy the default key or generate a new one

The free tier provides 60 calls/minute, which is sufficient for development and testing.

## Loading Environment Variables

Create the server entry point with dotenv integration:

```python
# server.py
import os
from dotenv import load_dotenv
from fastmcp import FastMCP

# Load .env file before accessing environment variables.
# This must be called before any os.getenv() calls.
load_dotenv()

mcp = FastMCP("API Server")

# Validate required configuration at startup.
# Failing fast prevents confusing errors during tool execution.
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not OPENWEATHER_API_KEY:
    raise ValueError(
        "OPENWEATHER_API_KEY is not set. "
        "Create a .env file or set the environment variable."
    )

if __name__ == "__main__":
    mcp.run()
```

## The .gitignore File

Ensure `.env` is excluded from version control. Create or update `.gitignore`:

```
# .gitignore
.env
.venv/
__pycache__/
```

This prevents accidental credential exposure in git repositories. For team collaboration, create a `.env.example` file that documents required variables without actual values:

```bash
# .env.example
OPENWEATHER_API_KEY=your_key_here
```

## Project Structure

```
mcp-api-server/
├── .venv/
├── .env              # API keys (git-ignored)
├── .env.example      # Template for required variables
├── .gitignore
├── .python-version
├── pyproject.toml
├── uv.lock
└── server.py
```

## Verifying Dependencies

Confirm all packages are installed:

```bash
uv run python -c "import fastmcp; import httpx; import dotenv; print('All dependencies OK')"
```

## Claude Desktop Environment Variables

When the server runs under Claude Desktop, environment variables can be passed via the config file:

```json
{
  "mcpServers": {
    "api-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/path/to/mcp-api-server",
      "env": {
        "OPENWEATHER_API_KEY": "your_key_here"
      }
    }
  }
}
```

The `env` field merges with the system environment. Variables set here override `.env` file values, providing a way to configure credentials per-client.

## Next Step

With dependencies configured and API keys loaded, you will implement the first async tool in the next phase.
