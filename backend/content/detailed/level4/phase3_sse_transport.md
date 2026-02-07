# SSE Transport Layer

## Converting from stdio to SSE

The stdio transport reads JSON-RPC messages from stdin. To deploy remotely, you need the SSE transport, which exposes HTTP endpoints for client communication.

## Modifying server.py

Update the server to use SSE transport:

```python
# server.py
import os
import time
import httpx
from dotenv import load_dotenv
from fastmcp import FastMCP

load_dotenv()

# Configure the server for SSE transport.
# The host and port determine where the HTTP server listens.
mcp = FastMCP(
    "API Server",
    host="0.0.0.0",   # Listen on all interfaces (required for Docker)
    port=8000          # HTTP port for SSE and message endpoints
)

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not OPENWEATHER_API_KEY:
    raise ValueError("OPENWEATHER_API_KEY is not set.")

# ... (tool implementations remain unchanged) ...

if __name__ == "__main__":
    # run() detects the transport configuration and starts
    # an HTTP server with SSE endpoints instead of stdio.
    mcp.run(transport="sse")
```

The key changes:
1. `host="0.0.0.0"` binds to all network interfaces (required inside Docker).
2. `port=8000` sets the HTTP listen port.
3. `mcp.run(transport="sse")` explicitly selects SSE transport.

## SSE Endpoints

When running in SSE mode, FastMCP exposes two HTTP endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/sse` | GET | Server-Sent Events stream for server-to-client messages |
| `/messages` | POST | Client-to-server JSON-RPC requests |

The client workflow:
1. Client opens an SSE connection to `GET /sse`.
2. Server sends an `endpoint` event containing the messages URL.
3. Client sends JSON-RPC requests via `POST /messages`.
4. Server pushes responses through the SSE stream.

## CORS Configuration

If clients connect from a different origin (e.g., a web-based MCP client), you need to configure CORS headers. FastMCP uses Starlette under the hood, so you can add CORS middleware:

```python
from starlette.middleware.cors import CORSMiddleware

# After creating the FastMCP instance:
mcp.settings.cors_origins = ["*"]  # Allow all origins (restrict in production)
```

For production, replace `"*"` with specific allowed origins.

## Testing SSE Locally

Start the server:

```bash
uv run server.py
```

In a separate terminal, test the SSE endpoint:

```bash
# Test that the SSE stream connects
curl -N http://localhost:8000/sse
```

You should see the SSE stream output with an `endpoint` event:

```
event: endpoint
data: /messages?session_id=abc123
```

Test a tool call via the messages endpoint:

```bash
curl -X POST http://localhost:8000/messages?session_id=abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

## Testing with Docker

Rebuild the Docker image and run with port mapping:

```bash
docker build -t mcp-api-server .

docker run -p 8000:8000 --env-file .env mcp-api-server
```

The `-p 8000:8000` flag maps the container's port 8000 to the host's port 8000. Verify the server is accessible:

```bash
curl http://localhost:8000/sse
```

## Inspector with SSE

The MCP Inspector can connect to SSE servers:

```bash
npx @modelcontextprotocol/inspector --url http://localhost:8000/sse
```

This connects via SSE instead of spawning a child process.

## Claude Desktop SSE Configuration

Update your Claude Desktop config to use the SSE endpoint:

```json
{
  "mcpServers": {
    "remote-api-server": {
      "url": "http://localhost:8000/sse"
    }
  }
}
```

Note the simpler configuration: no `command`, `args`, or `cwd` needed. The client connects directly to the HTTP endpoint.

## Common Issues

**Connection refused**: Ensure the server is running and the port is not blocked by a firewall.

**SSE stream closes immediately**: Check server logs for startup errors. The server must fully initialize before accepting connections.

**CORS errors in browser clients**: Add the appropriate CORS middleware configuration.

## Next Step

With SSE transport working locally in Docker, you are ready to deploy to a cloud platform. The next phase covers Railway deployment.
