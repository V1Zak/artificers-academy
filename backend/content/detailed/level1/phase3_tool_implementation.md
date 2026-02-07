# Tool Implementation

## MCP Tools

Tools are the primary mechanism for an LLM to perform actions through an MCP server. When a client calls `tools/list`, the server returns a JSON schema for each registered tool. The LLM uses these schemas to determine when and how to invoke tools during a conversation.

## Defining a Tool with @mcp.tool()

Add the following to `server.py`:

```python
# server.py
from fastmcp import FastMCP
import httpx

mcp = FastMCP("Oracle Server")

@mcp.tool()
async def get_card(card_name: str) -> str:
    """Look up a Magic: The Gathering card by name.

    Fetches card data from the Scryfall API including oracle text,
    mana cost, type line, and current legality information.

    Args:
        card_name: The exact or fuzzy name of the card to search for.

    Returns:
        Formatted card information as a text string.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.scryfall.com/cards/named",
            params={"fuzzy": card_name}
        )

        if response.status_code != 200:
            return f"Error: Card '{card_name}' not found (HTTP {response.status_code})"

        card = response.json()

    return (
        f"Name: {card['name']}\n"
        f"Mana Cost: {card.get('mana_cost', 'N/A')}\n"
        f"Type: {card['type_line']}\n"
        f"Oracle Text: {card.get('oracle_text', 'N/A')}\n"
        f"Set: {card['set_name']}"
    )
```

## How It Works

The `@mcp.tool()` decorator registers the function with the MCP server. FastMCP performs the following automatically:

1. **Schema generation**: Python type hints (`card_name: str`) are converted into a JSON Schema that the client receives via `tools/list`.
2. **Docstring extraction**: The function's docstring becomes the tool's `description` field. LLMs use this to decide when to invoke the tool.
3. **Parameter validation**: Incoming arguments are validated against the generated schema before your function executes.
4. **Response wrapping**: The return value is wrapped in the JSON-RPC response format with `content` blocks.

## The JSON-RPC Exchange

When the LLM decides to use your tool, the following messages are exchanged:

```json
// Client sends tools/call
{
  "jsonrpc": "2.0",
  "id": 42,
  "method": "tools/call",
  "params": {
    "name": "get_card",
    "arguments": { "card_name": "Lightning Bolt" }
  }
}

// Server responds
{
  "jsonrpc": "2.0",
  "id": 42,
  "result": {
    "content": [{
      "type": "text",
      "text": "Name: Lightning Bolt\nMana Cost: {R}\n..."
    }]
  }
}
```

## Docstrings Are Critical

The tool description is the single most important factor in determining whether an LLM will correctly invoke your tool. Write docstrings that clearly state:

- **What** the tool does
- **When** to use it (and when not to)
- **What** each parameter expects
- **What** the return value contains

A poorly documented tool will be ignored or misused by the model.

## Error Handling

Tools should return user-readable error messages, not raise exceptions. If the Scryfall API returns a non-200 status, we return a formatted error string. Unhandled exceptions in tools result in a JSON-RPC error response, which the client may not display to the user.

## Adding the Entry Point

Ensure `server.py` ends with:

```python
if __name__ == "__main__":
    mcp.run()
```

The `mcp.run()` method starts the stdio transport listener, reading JSON-RPC messages from stdin and writing responses to stdout.

## Validation

To confirm your tool is registered correctly, you will use the MCP Inspector in the next phase.
