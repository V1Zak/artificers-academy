# MCP Architecture Overview

## The Model Context Protocol

The Model Context Protocol (MCP) is an open standard that defines how LLM applications communicate with external data sources and tools. It follows a **client-host-server** architecture built on top of JSON-RPC 2.0.

## Architecture Components

MCP defines three distinct roles:

- **Host**: The application the user interacts with (e.g., Claude Desktop, an IDE). The host manages client lifecycle and enforces security policies.
- **Client**: A protocol-level component inside the host that maintains a 1:1 connection with a single MCP server. Each client negotiates capabilities and routes messages.
- **Server**: A lightweight process that exposes tools, resources, and prompts to clients. A single host may connect to multiple servers simultaneously.

```
┌─────────────────────────────────────┐
│  Host (Claude Desktop)              │
│                                     │
│  ┌──────────┐    ┌──────────┐       │
│  │ Client A │    │ Client B │       │
│  └────┬─────┘    └────┬─────┘       │
└───────┼───────────────┼─────────────┘
        │               │
   ┌────▼─────┐    ┌────▼─────┐
   │ Server A │    │ Server B │
   │ (Tools)  │    │ (Data)   │
   └──────────┘    └──────────┘
```

## JSON-RPC 2.0 Message Format

All MCP communication uses JSON-RPC 2.0. There are three message types:

**Request** (client to server):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": { "city": "Seattle" }
  }
}
```

**Response** (server to client):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      { "type": "text", "text": "72°F, partly cloudy" }
    ]
  }
}
```

**Notification** (no response expected):
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

## Connection Lifecycle

1. **Initialization**: The client sends `initialize` with its protocol version and capabilities. The server responds with its own capabilities (supported tools, resources, prompts).
2. **Initialized notification**: The client sends `notifications/initialized` to signal readiness.
3. **Operation**: Normal request/response exchange. The client can call `tools/list`, `tools/call`, `resources/read`, etc.
4. **Shutdown**: Either side can close the transport connection.

## Server Primitives

MCP servers expose three primitive types:

| Primitive | Control | Purpose |
|-----------|---------|---------|
| **Tools** | Model-controlled | Functions the LLM can invoke (e.g., API calls, computations) |
| **Resources** | Application-controlled | Read-only data the host application can surface to the LLM |
| **Prompts** | User-controlled | Pre-built templates that users can select to configure context |

## Transport Layers

MCP supports two transport mechanisms:

- **stdio**: Communication via standard input/output streams. Used for local servers spawned as child processes. Low latency, no network overhead.
- **SSE (Server-Sent Events)**: HTTP-based transport for remote servers. The client sends requests via HTTP POST and receives responses over an SSE stream.

In this module, you will build a server using stdio transport. Module 4 covers SSE for production deployment.

## Key Takeaway

MCP decouples tool/data providers from the LLM application layer. By implementing the protocol, your server becomes compatible with any MCP-compliant client without modification.
