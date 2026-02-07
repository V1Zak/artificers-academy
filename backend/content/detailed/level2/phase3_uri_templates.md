# Resource URI Templates

## URI Templates in MCP

MCP resources are identified by URIs. For dynamic resources (where the URI contains variable segments), MCP uses URI templates based on RFC 6570. FastMCP maps these templates to Python function parameters.

## Implementing a Directory Listing Resource

Add a resource that lists all files in the `docs/` directory:

```python
# server.py
from pathlib import Path
from fastmcp import FastMCP

mcp = FastMCP("File Server")

DOCS_DIR = Path(__file__).parent / "docs"
DOCS_DIR = DOCS_DIR.resolve()

@mcp.resource("file://docs")
async def list_docs() -> str:
    """List all available documents in the docs directory.

    Returns a newline-separated list of filenames available
    for reading via the file://docs/{filename} resource.
    """
    files = sorted(DOCS_DIR.glob("*.md"))
    if not files:
        return "No documents found."

    return "\n".join(f.name for f in files)
```

This resource has a static URI (`file://docs`) with no variable segments. When a client calls `resources/read` with this URI, the server returns the file listing.

## Implementing a Parameterized Resource

Now add a resource with a URI template that reads a specific file:

```python
@mcp.resource("file://docs/{filename}")
async def read_doc(filename: str) -> str:
    """Read a specific document from the docs directory.

    Args:
        filename: The name of the file to read (e.g., 'introduction.md').

    Returns:
        The full text content of the requested document.
    """
    file_path = DOCS_DIR / filename

    if not file_path.exists():
        return f"Error: File '{filename}' not found."

    return file_path.read_text(encoding="utf-8")
```

The `{filename}` segment in the URI template maps directly to the function parameter. When a client requests `file://docs/introduction.md`, FastMCP extracts `"introduction.md"` and passes it as the `filename` argument.

## How Resource Discovery Works

Clients discover resources through two JSON-RPC methods:

**resources/list** returns concrete resources:
```json
{
  "resources": [
    {
      "uri": "file://docs",
      "name": "list_docs",
      "description": "List all available documents..."
    }
  ]
}
```

**resources/templates/list** returns URI templates:
```json
{
  "resourceTemplates": [
    {
      "uriTemplate": "file://docs/{filename}",
      "name": "read_doc",
      "description": "Read a specific document..."
    }
  ]
}
```

The client uses the template to construct concrete URIs for `resources/read` calls.

## Testing with the Inspector

Launch the Inspector and navigate to the **Resources** tab:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

1. You should see `file://docs` listed as a concrete resource. Click it to read the directory listing.
2. Check the **Resource Templates** section for `file://docs/{filename}`.
3. Enter `introduction.md` in the filename field and read the resource.

Verify that the response contains the file contents.

## URI Design Guidelines

When designing resource URIs, follow these conventions:

- Use a consistent scheme prefix (`file://`, `db://`, `config://`)
- Use hierarchical paths that reflect the data structure
- Keep template variables descriptive (`{filename}` not `{f}`)
- Avoid query parameters in URIs; use path segments instead

## Security Note

The current `read_doc` implementation has a vulnerability: a client could request `file://docs/../../etc/passwd` and the path resolution would escape the `docs/` directory. The next phase addresses this with proper path traversal prevention.
