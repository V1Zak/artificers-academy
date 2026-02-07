# Inspector & Debugging

## The MCP Inspector

The MCP Inspector is an interactive debugging tool that acts as a temporary MCP client. It connects to your server, discovers its capabilities, and lets you invoke tools and read resources manually. Always test with the Inspector before connecting to a production client.

## Launching the Inspector

The Inspector is distributed as an npm package. You do not need to install it globally; `npx` will download and execute it:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

This command does two things:
1. Starts your MCP server as a child process using `uv run server.py`
2. Launches the Inspector web UI, typically at `http://localhost:5173`

Open the URL in your browser. The Inspector UI has three main panels: **Tools**, **Resources**, and **Prompts**.

## Inspecting Registered Tools

Click the **Tools** tab. You should see `get_card` listed with its JSON Schema:

```json
{
  "name": "get_card",
  "description": "Look up a Magic: The Gathering card by name...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "card_name": {
        "type": "string",
        "title": "Card Name"
      }
    },
    "required": ["card_name"]
  }
}
```

This schema was auto-generated from your function's type annotations. Verify that the `description` matches your docstring and all parameters appear under `properties`.

## Executing a Test Call

Enter a test value in the `card_name` field (e.g., "Lightning Bolt") and click **Run**. The Inspector displays:

1. **Request**: The outgoing `tools/call` JSON-RPC message
2. **Response**: The server's JSON-RPC result
3. **Formatted output**: The text content rendered for readability

Verify the response contains the expected card data. If you see an error, check:

- Is the Scryfall API reachable from your network?
- Is `httpx` installed in your environment?
- Does the function handle non-200 status codes?

## Reading the Message Log

The Inspector's **Messages** panel shows every JSON-RPC message exchanged during the session. This is invaluable for debugging:

```
→ {"jsonrpc":"2.0","id":0,"method":"initialize",...}
← {"jsonrpc":"2.0","id":0,"result":{"capabilities":{...}}}
→ {"jsonrpc":"2.0","method":"notifications/initialized"}
→ {"jsonrpc":"2.0","id":1,"method":"tools/list"}
← {"jsonrpc":"2.0","id":1,"result":{"tools":[...]}}
→ {"jsonrpc":"2.0","id":2,"method":"tools/call",...}
← {"jsonrpc":"2.0","id":2,"result":{"content":[...]}}
```

Study this log to understand the full initialization handshake and capability negotiation.

## Common Issues

**Server does not start:**
- Ensure `uv run server.py` works standalone (press Ctrl+C after confirming no errors).
- Check that `pyproject.toml` lists all dependencies.

**Tool not listed:**
- Verify the `@mcp.tool()` decorator is applied.
- Ensure `mcp.run()` is called in the `if __name__ == "__main__"` block.

**Empty or error response:**
- Check the Inspector's stderr output for Python tracebacks.
- Add `print()` statements to your tool function (they will appear in stderr, not in the JSON-RPC stream).

## Debugging with Print Statements

Because MCP uses stdio for transport, `print()` output goes to stderr (not stdout) when using FastMCP. This means print statements will appear in the Inspector's server output panel without corrupting the JSON-RPC message stream.

```python
@mcp.tool()
async def get_card(card_name: str) -> str:
    print(f"DEBUG: Received request for '{card_name}'")  # visible in stderr
    # ... rest of implementation
```

## Next Step

Once your tool executes correctly in the Inspector, you are ready to connect to a full MCP client.
