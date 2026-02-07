# Transport Protocols

## MCP Transport Layers

MCP is transport-agnostic: the protocol defines message formats (JSON-RPC 2.0) but not how those messages are delivered. The specification defines two standard transports: **stdio** and **SSE**. Understanding both is essential for production deployment.

## stdio Transport

The stdio (standard input/output) transport is used for local MCP servers that run as child processes of the host application.

**How it works:**
1. The host spawns the server as a subprocess.
2. JSON-RPC messages are written to the server's stdin.
3. Responses are read from the server's stdout.
4. Server logs and debug output go to stderr.

```
Host Process
  └── stdin  →  Server Process (child)
  └── stdout ←  Server Process
  └── stderr ←  Server Process (logs)
```

**Advantages:**
- Zero network configuration
- No authentication required (process-level isolation)
- Lowest possible latency (IPC, no TCP overhead)
- Simple security model (host controls the process lifecycle)

**Limitations:**
- Server must run on the same machine as the host
- One server instance per host connection
- No remote access capability

**When to use:** Development, local tools, desktop applications where the MCP server runs alongside the client.

## SSE Transport (Server-Sent Events)

The SSE transport enables remote MCP servers accessible over HTTP. It uses two HTTP channels:

1. **POST endpoint** (`/messages`): The client sends JSON-RPC requests via HTTP POST.
2. **SSE endpoint** (`/sse`): The server pushes responses and notifications via a Server-Sent Events stream.

```
Client ──HTTP POST──→ Server /messages
Client ←──SSE stream── Server /sse
```

**Advantages:**
- Remote access from any network-connected client
- Multiple clients can connect to a single server
- Standard HTTP infrastructure (load balancers, TLS, proxies)
- Server can be deployed to cloud platforms

**Limitations:**
- Requires network configuration (ports, DNS, TLS)
- Authentication must be implemented separately
- Higher latency than stdio (network round-trip)
- SSE is unidirectional (server to client); requests use separate POST channel

**When to use:** Production deployments, shared servers, cloud-hosted services, multi-user environments.

## Protocol Comparison

| Aspect | stdio | SSE |
|--------|-------|-----|
| Deployment | Local only | Local or remote |
| Latency | ~1ms (IPC) | 10-100ms (network) |
| Authentication | Process isolation | Must implement |
| Scaling | 1:1 (host:server) | N:1 (clients:server) |
| Infrastructure | None | HTTP server, DNS, TLS |
| Claude Desktop | `command` + `args` | `url` field |
| FastMCP default | Yes | Requires configuration |

## Claude Desktop Configuration

The transport type determines the config structure:

**stdio (local):**
```json
{
  "mcpServers": {
    "local-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/path/to/project"
    }
  }
}
```

**SSE (remote):**
```json
{
  "mcpServers": {
    "remote-server": {
      "url": "https://my-server.railway.app/sse"
    }
  }
}
```

## The Streamable HTTP Transport

The MCP specification also defines an experimental **Streamable HTTP** transport that uses standard HTTP request/response patterns with optional streaming. This is designed to work better with existing HTTP infrastructure but is not yet widely supported by clients.

## What You Will Build

In the following phases, you will:
1. Containerize the MCP server with Docker
2. Convert from stdio to SSE transport
3. Deploy to Railway for public access
4. Configure Claude Desktop to connect remotely
