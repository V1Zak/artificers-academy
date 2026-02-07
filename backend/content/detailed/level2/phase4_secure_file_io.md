# Secure File I/O

## The Directory Traversal Problem

The resource handler from the previous phase is vulnerable to path traversal attacks. If a client sends `file://docs/../../etc/passwd`, the naive path concatenation (`DOCS_DIR / filename`) resolves to a file outside the intended directory.

This is a critical security concern because MCP servers may run with the user's full filesystem permissions.

## The Attack Vector

```python
# Vulnerable implementation
file_path = DOCS_DIR / filename
# If filename = "../../etc/passwd"
# file_path resolves to /etc/passwd
```

Even though MCP resources are application-controlled (not model-controlled), a compromised or malicious client could exploit this to read arbitrary files.

## The Fix: Path Canonicalization

Use `pathlib.Path.resolve()` to canonicalize the constructed path, then verify it is still within the allowed directory:

```python
@mcp.resource("file://docs/{filename}")
async def read_doc(filename: str) -> str:
    """Read a specific document from the docs directory.

    Implements path traversal prevention by resolving the
    canonical path and verifying it remains within DOCS_DIR.

    Args:
        filename: The name of the file to read.

    Returns:
        The file content, or an error message if access is denied.
    """
    # Construct the candidate path
    file_path = (DOCS_DIR / filename).resolve()

    # Security check: ensure the resolved path is within DOCS_DIR.
    # Path.is_relative_to() returns True if the path starts with
    # the given prefix after both are resolved.
    if not file_path.is_relative_to(DOCS_DIR):
        return "Error: Access denied. Path is outside the allowed directory."

    if not file_path.exists():
        return f"Error: File '{filename}' not found."

    if not file_path.is_file():
        return f"Error: '{filename}' is not a file."

    return file_path.read_text(encoding="utf-8")
```

## How resolve() Prevents Traversal

`Path.resolve()` performs two operations:

1. **Absolute path conversion**: Converts any relative path to absolute.
2. **Symlink and `..` resolution**: Eliminates `..`, `.`, and follows symlinks to produce a canonical path.

After resolution:
```python
# Traversal attempt
path = (Path("/home/user/docs") / "../../etc/passwd").resolve()
# path = Path("/etc/passwd")

# is_relative_to check
path.is_relative_to(Path("/home/user/docs"))
# Returns False → access denied
```

## Complete Secure Server

Here is the complete `server.py` with both resources secured:

```python
from pathlib import Path
from fastmcp import FastMCP

mcp = FastMCP("File Server")

DOCS_DIR = Path(__file__).parent / "docs"
DOCS_DIR = DOCS_DIR.resolve()

@mcp.resource("file://docs")
async def list_docs() -> str:
    """List all available documents in the docs directory."""
    files = sorted(DOCS_DIR.glob("*.md"))
    if not files:
        return "No documents found."
    return "\n".join(f.name for f in files)

@mcp.resource("file://docs/{filename}")
async def read_doc(filename: str) -> str:
    """Read a specific document with path traversal prevention."""
    file_path = (DOCS_DIR / filename).resolve()

    if not file_path.is_relative_to(DOCS_DIR):
        return "Error: Access denied. Path is outside the allowed directory."

    if not file_path.exists():
        return f"Error: File '{filename}' not found."

    if not file_path.is_file():
        return f"Error: '{filename}' is not a file."

    return file_path.read_text(encoding="utf-8")

if __name__ == "__main__":
    mcp.run()
```

## Testing the Security Check

In the Inspector, try reading these resources:

| URI | Expected Result |
|-----|----------------|
| `file://docs/introduction.md` | File contents |
| `file://docs/../../etc/passwd` | Access denied error |
| `file://docs/nonexistent.md` | File not found error |
| `file://docs/` | Not a file error (if docs/ resolves to directory) |

## Additional Hardening

For production servers, consider these additional measures:

- **File size limits**: Check `file_path.stat().st_size` before reading to prevent memory exhaustion.
- **Allowed extensions**: Restrict to `.md`, `.txt`, etc. using `file_path.suffix`.
- **Rate limiting**: Prevent excessive file reads via request throttling.
- **Audit logging**: Log all file access attempts for security monitoring.

## Python Version Note

`Path.is_relative_to()` was introduced in Python 3.9. For older Python versions, use:

```python
try:
    file_path.relative_to(DOCS_DIR)
except ValueError:
    return "Error: Access denied."
```
