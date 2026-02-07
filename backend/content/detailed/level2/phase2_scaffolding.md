# Project Scaffolding

## New Project Setup

Create a new MCP server project for the filesystem resource provider:

```bash
mkdir mcp-file-server
cd mcp-file-server
uv init
uv add "fastmcp[cli]"
```

Note that this server does not need `httpx` since it only accesses the local filesystem.

## Creating Sample Data

Create a `docs/` directory with sample files that the server will expose as resources:

```bash
mkdir docs
```

Create three sample files:

**docs/introduction.md:**
```markdown
# Introduction
This is a sample document for the MCP file server.
It demonstrates how resources expose read-only data.
```

**docs/architecture.md:**
```markdown
# Architecture
MCP uses a client-host-server model with JSON-RPC 2.0
for all communication between components.
```

**docs/deployment.md:**
```markdown
# Deployment
MCP servers can be deployed locally (stdio) or
remotely (SSE) depending on the use case.
```

## Server Entry Point

Create `server.py` with the initial FastMCP configuration:

```python
# server.py
from pathlib import Path
from fastmcp import FastMCP

# Initialize the MCP server
mcp = FastMCP("File Server")

# Define the base directory for file access.
# Using Path.resolve() converts to an absolute path,
# which is essential for path traversal prevention later.
DOCS_DIR = Path(__file__).parent / "docs"
DOCS_DIR = DOCS_DIR.resolve()

if __name__ == "__main__":
    mcp.run()
```

## Why pathlib?

The `pathlib` module provides object-oriented filesystem path handling. It is essential for this project for two reasons:

1. **Cross-platform compatibility**: `Path` objects handle `/` vs `\` separators automatically.
2. **Security**: `Path.resolve()` canonicalizes paths, eliminating `..` segments. This is the foundation of directory traversal prevention, which you will implement in Phase 4.

## Project Structure

Your project should now look like this:

```
mcp-file-server/
├── .venv/
├── .python-version
├── pyproject.toml
├── uv.lock
├── server.py
└── docs/
    ├── introduction.md
    ├── architecture.md
    └── deployment.md
```

## Configuration Constants

It is good practice to define configuration as module-level constants rather than hard-coding values inside functions. The `DOCS_DIR` constant serves as the root boundary for all file operations. In a production server, you might load this from an environment variable:

```python
import os
from pathlib import Path

# Allow override via environment variable, with a sensible default
DOCS_DIR = Path(os.getenv("MCP_DOCS_DIR", "./docs")).resolve()
```

## Verification

Run the server to confirm it starts cleanly:

```bash
uv run server.py
```

The server should start without errors and wait for JSON-RPC input on stdin. Press `Ctrl+C` to stop it. If you see `ModuleNotFoundError`, run `uv sync` to ensure all dependencies are installed.

## Next Steps

With the project structure in place, you will now implement resource handlers that expose the `docs/` directory contents via MCP's resource protocol. The next phase covers URI templates for dynamic resource routing.
