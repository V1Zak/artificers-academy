# Environment Setup

## Prerequisites

- Python 3.12 or higher
- A terminal with shell access
- A text editor or IDE

## Installing uv

`uv` is a fast Python package and project manager written in Rust. It replaces `pip`, `venv`, and `pip-tools` in a single binary. Install it with the official installer:

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Verify the installation:

```bash
uv --version
# uv 0.5.x
```

## Initializing the Project

Create a new project directory and initialize it with `uv`:

```bash
# Create and enter project directory
mkdir mcp-oracle-server
cd mcp-oracle-server

# Initialize Python project (creates pyproject.toml)
uv init
```

This generates a `pyproject.toml` with your project metadata. The file serves the same role as `package.json` in the Node.js ecosystem: it declares your project's dependencies and metadata.

## Adding Dependencies

Install FastMCP with CLI extras and httpx for HTTP requests:

```bash
# Install FastMCP (the high-level MCP SDK for Python)
uv add "fastmcp[cli]"

# Install httpx for async HTTP client functionality
uv add httpx
```

`uv` automatically creates a virtual environment in `.venv/` and resolves all transitive dependencies. Your `pyproject.toml` now includes:

```toml
[project]
name = "mcp-oracle-server"
version = "0.1.0"
dependencies = [
    "fastmcp[cli]",
    "httpx",
]
```

## Creating the Server Entry Point

Create `server.py` as the main entry point:

```python
# server.py
from fastmcp import FastMCP

# Initialize the MCP server with a descriptive name.
# This name appears in client UIs and Inspector listings.
mcp = FastMCP("Oracle Server")
```

The `FastMCP` class abstracts the JSON-RPC protocol layer. It handles capability negotiation, message routing, and transport management. You register tools, resources, and prompts as decorated functions on this instance.

## Verifying the Setup

Run the server to confirm it starts without errors:

```bash
uv run server.py
```

The process will block waiting for JSON-RPC messages on stdin. Press `Ctrl+C` to terminate. If you see no errors, the environment is correctly configured.

## Project Structure

At this point, your project should look like this:

```
mcp-oracle-server/
├── .venv/              # Managed by uv (do not edit)
├── .python-version     # Python version pin
├── pyproject.toml      # Project metadata and dependencies
├── uv.lock             # Lockfile (deterministic builds)
└── server.py           # MCP server entry point
```

## Notes on uv vs pip

`uv` provides several advantages over traditional `pip` workflows:

- **Deterministic resolution**: `uv.lock` ensures identical installs across machines.
- **Speed**: Dependency resolution and installation are 10-100x faster than pip.
- **Unified toolchain**: No need for separate `venv`, `pip`, and `pip-tools` commands.
- **Script execution**: `uv run` automatically activates the virtual environment.

All subsequent commands in this curriculum use `uv run` to execute scripts within the managed environment.
