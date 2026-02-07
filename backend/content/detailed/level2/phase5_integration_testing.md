# Integration Testing

## Testing the Complete Server

Before connecting to Claude Desktop, thoroughly validate the server's behavior through the MCP Inspector and manual verification. This phase covers a systematic testing approach.

## Inspector Test Plan

Launch the Inspector:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

### Test 1: Resource Discovery

Open the **Resources** tab and verify:
- `file://docs` appears as a concrete resource
- `file://docs/{filename}` appears as a resource template
- Both have descriptions populated from their docstrings

### Test 2: Directory Listing

Read the `file://docs` resource. Expected response:

```
architecture.md
deployment.md
introduction.md
```

Verify the output is sorted alphabetically and contains only `.md` files.

### Test 3: File Reading

Read `file://docs/introduction.md`. Verify the full file content is returned with correct encoding (no garbled characters).

### Test 4: Path Traversal Prevention

Attempt to read `file://docs/../../etc/passwd`. Verify the response is:

```
Error: Access denied. Path is outside the allowed directory.
```

### Test 5: Missing File Handling

Read `file://docs/nonexistent.md`. Verify the response is:

```
Error: File 'nonexistent.md' not found.
```

## Writing Automated Tests

For production MCP servers, write automated tests using pytest. FastMCP provides test utilities:

```python
# test_server.py
import pytest
from server import mcp, DOCS_DIR

@pytest.mark.asyncio
async def test_list_docs():
    """Verify directory listing returns expected files."""
    # Access the resource handler directly
    result = await mcp.read_resource("file://docs")
    assert "introduction.md" in result
    assert "architecture.md" in result

@pytest.mark.asyncio
async def test_read_doc():
    """Verify file reading returns content."""
    result = await mcp.read_resource("file://docs/introduction.md")
    assert "Introduction" in result

@pytest.mark.asyncio
async def test_path_traversal_blocked():
    """Verify directory traversal is prevented."""
    result = await mcp.read_resource("file://docs/../../etc/passwd")
    assert "Access denied" in result

@pytest.mark.asyncio
async def test_missing_file():
    """Verify missing files return an error."""
    result = await mcp.read_resource("file://docs/nonexistent.md")
    assert "not found" in result
```

Install test dependencies:

```bash
uv add --dev pytest pytest-asyncio
```

Run the tests:

```bash
uv run pytest test_server.py -v
```

## Claude Desktop Integration

Register the server in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "file-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/absolute/path/to/mcp-file-server"
    }
  }
}
```

After restarting Claude Desktop, test with prompts like:
- "What documents are available in the file server?"
- "Read the introduction document for me."
- "Summarize all available documents."

Claude will use the resource discovery mechanism to list and read files.

## Observing the Protocol Exchange

In Claude Desktop's developer logs, you can observe the full JSON-RPC exchange:

1. `resources/list` returns the concrete `file://docs` resource
2. `resources/templates/list` returns the `file://docs/{filename}` template
3. The host application decides which resources to surface to the LLM
4. `resources/read` fetches specific file contents as needed

This differs from tools, where the model initiates invocation. With resources, the host application controls when data is fetched and included in context.

## Module 2 Complete

You have built a filesystem resource provider with URI templates, path traversal prevention, and integration tests. In Module 3, you will integrate external APIs with async patterns and caching.
