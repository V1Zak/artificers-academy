# Putting It Together

Your file server now has resources for listing and reading files, plus a search tool. Let's test everything and connect it to Claude Desktop.

## Your Complete Server

Here is what your `server.py` should look like:

```python
from pathlib import Path
from fastmcp import FastMCP

mcp = FastMCP("File Server")

DOCS_DIR = Path(__file__).parent / "documents"


@mcp.resource("file://documents")
def list_documents() -> str:
    """List all available text files in the documents folder."""
    files = sorted(DOCS_DIR.glob("*.txt"))
    if not files:
        return "No documents found."

    file_list = []
    for f in files:
        size = f.stat().st_size
        file_list.append(f"- {f.name} ({size} bytes)")

    return "Available documents:\n" + "\n".join(file_list)


@mcp.resource("file://documents/{filename}")
def read_document(filename: str) -> str:
    """Read the contents of a specific document."""
    file_path = (DOCS_DIR / filename).resolve()

    if not str(file_path).startswith(str(DOCS_DIR.resolve())):
        return "Access denied: that path is outside the allowed folder."

    if not file_path.exists():
        return f"File not found: {filename}"

    if not file_path.suffix == ".txt":
        return "Only .txt files can be read."

    return file_path.read_text()


@mcp.tool()
def search_documents(query: str) -> str:
    """Search for a word or phrase across all documents."""
    results = []
    for file_path in sorted(DOCS_DIR.glob("*.txt")):
        content = file_path.read_text()
        for i, line in enumerate(content.splitlines(), 1):
            if query.lower() in line.lower():
                results.append(f"{file_path.name} (line {i}): {line.strip()}")

    if not results:
        return f"No matches found for '{query}'."

    return f"Found {len(results)} match(es):\n" + "\n".join(results)
```

## Test with the Inspector

Run the Inspector to verify everything:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

In the Inspector, check:

1. **Resources tab** -- You should see `file://documents`. Click it to see the file list.
2. **Tools tab** -- You should see `search_documents`. Try searching for "pasta" or "recipe".
3. **Try a dynamic resource** -- Access `file://documents/recipes.txt` to see the recipe content.

## Connect to Claude Desktop

Update your Claude Desktop configuration file to point to this new server. Open the config file and change it:

```json
{
  "mcpServers": {
    "file-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/full/path/to/file-server"
    }
  }
}
```

Restart Claude Desktop, then try these prompts:

- "What documents are available?"
- "Show me the recipe file"
- "Search the documents for the word project"

## What You Learned

In this level, you learned the difference between tools and resources, how to create resources with fixed and dynamic URIs, how to protect against path traversal attacks, and how to combine tools and resources in one server. These are fundamental patterns you will use in every MCP server you build.

Next up: connecting your server to live data from the internet.
