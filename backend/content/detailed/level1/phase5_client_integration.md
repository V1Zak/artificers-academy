# Client Integration

## Connecting to Claude Desktop

Claude Desktop is the reference MCP host application. It manages client instances, enforces tool-use approval policies, and renders tool results in the chat interface. In this phase, you will register your MCP server with Claude Desktop.

## Configuration File Location

Claude Desktop reads server configurations from a JSON file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

If the file does not exist, create it.

## Registering Your Server

Add your server to the `mcpServers` object. Each key is a unique identifier for the server:

```json
{
  "mcpServers": {
    "oracle-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/absolute/path/to/mcp-oracle-server"
    }
  }
}
```

**Field reference:**

| Field | Required | Description |
|-------|----------|-------------|
| `command` | Yes | The executable to run. Use `uv` since it manages the virtual environment. |
| `args` | Yes | Command-line arguments passed to the executable. |
| `cwd` | Recommended | The working directory. Must be an absolute path to your project root. |
| `env` | Optional | Additional environment variables (e.g., API keys). |

## How Client-Server Communication Works

When Claude Desktop starts (or when you restart it after editing the config):

1. The host reads `claude_desktop_config.json`.
2. For each entry in `mcpServers`, it spawns the command as a child process.
3. A client instance is created and performs the JSON-RPC initialization handshake over stdio.
4. The client calls `tools/list` to discover available tools.
5. Tool schemas are injected into the LLM's system prompt.

When a user sends a message that could benefit from a tool, the LLM generates a `tools/call` request. Claude Desktop displays a confirmation dialog before executing it.

## Verifying the Connection

After restarting Claude Desktop:

1. Open a new conversation.
2. Look for a hammer icon or tools indicator in the input area. This confirms at least one MCP server is connected.
3. Type a prompt that should trigger your tool, for example: "Look up the Magic card Lightning Bolt."
4. Claude should invoke `get_card` and display the formatted result.

## Troubleshooting

**Server not appearing:**
- Verify the JSON syntax in `claude_desktop_config.json` (trailing commas are invalid).
- Ensure the `cwd` path is absolute and the directory exists.
- Restart Claude Desktop completely (quit and reopen, not just close the window).

**Tool invocation fails:**
- Check Claude Desktop's developer logs for stderr output from your server.
- On macOS: `~/Library/Logs/Claude/` contains log files.
- Run `uv run server.py` from the specified `cwd` to confirm it starts correctly.

**Permission denied:**
- Ensure `uv` is on the system PATH visible to Claude Desktop.
- If you installed `uv` for a specific shell profile, add the full path: `"command": "/Users/you/.cargo/bin/uv"`.

## Multiple Servers

You can register multiple MCP servers simultaneously. Each operates as an independent process with its own client connection:

```json
{
  "mcpServers": {
    "oracle-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/path/to/oracle-server"
    },
    "file-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/path/to/file-server"
    }
  }
}
```

The LLM receives tools from all connected servers and selects the appropriate one based on the tool descriptions.

## Module 1 Complete

You have built a functional MCP server with a tool, tested it via the Inspector, and connected it to Claude Desktop. In Module 2, you will add the second MCP primitive: resources.
