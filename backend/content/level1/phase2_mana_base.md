# Phase 2: Preparing Your Mana Base

*"A Planeswalker without mana is just a wanderer. Let us tap into the aether."*

---

## Prerequisites

Before we begin, ensure you have:

- **Python 3.10+** installed on your system
- A terminal/command line ready
- A code editor (VS Code, Cursor, or your preferred tool)

---

## Installing uv: The Mana Accelerant

We'll use **uv**—a blazingly fast Python package manager. Think of it as a mana accelerant that makes everything faster.

### macOS / Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Windows

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Verify Installation

```bash
uv --version
```

You should see something like `uv 0.4.x` (or higher).

---

## Creating Your Sanctum

Let's create a new project directory—your personal sanctum where you'll craft your MTG Oracle.

```bash
# Create and enter your project directory
mkdir mtg-oracle-server
cd mtg-oracle-server

# Initialize a new Python project with uv
uv init
```

This creates the basic project structure:

```
mtg-oracle-server/
├── .python-version    # Python version specification
├── pyproject.toml     # Project configuration
├── README.md          # Project documentation
└── hello.py           # Sample file (we'll replace this)
```

---

## Tapping Your Mana Sources

Now let's add the dependencies—the mana sources that power our server.

```bash
# Add fastmcp - the core library for building MCP servers
uv add fastmcp

# Add httpx - for making HTTP requests to Scryfall API
uv add httpx
```

Your `pyproject.toml` should now include these dependencies:

```toml
[project]
name = "mtg-oracle-server"
version = "0.1.0"
dependencies = [
    "fastmcp>=0.1.0",
    "httpx>=0.27.0",
]
```

---

## Understanding fastmcp

**fastmcp** is a Python library that makes building MCP servers effortless. It handles:

- Protocol communication (JSON-RPC 2.0)
- Tool registration and invocation
- Resource management
- Error handling

With fastmcp, you can focus on **what** your tools do, not **how** they communicate.

### The Incantation

Every fastmcp server starts with this basic structure:

```python
from fastmcp import FastMCP

# Create your server instance - your "deck"
mcp = FastMCP("MTG Oracle")

# Your tools (sorceries) will go here...

# Run the server
if __name__ == "__main__":
    mcp.run()
```

That's it! The `FastMCP` class handles all the protocol details.

---

## Creating Your Server File

Delete the sample `hello.py` and create `server.py`:

```bash
# Remove the sample file
rm hello.py

# Create your server file (we'll add content in the next phase)
touch server.py
```

---

## Project Structure Check

Your sanctum should now look like this:

```
mtg-oracle-server/
├── .python-version
├── .venv/              # Created by uv (virtual environment)
├── pyproject.toml
├── README.md
├── server.py           # Your MCP server (empty for now)
└── uv.lock            # Dependency lock file
```

---

## Verifying Your Setup

Let's make sure everything is working. Add this minimal code to `server.py`:

```python
from fastmcp import FastMCP

# Create the server
mcp = FastMCP("MTG Oracle")

@mcp.tool()
def ping() -> str:
    """A simple test tool that returns 'pong'."""
    return "pong"

if __name__ == "__main__":
    mcp.run()
```

Run it to verify:

```bash
uv run server.py
```

You should see output indicating the server is running. Press `Ctrl+C` to stop it.

---

## Troubleshooting

### "uv: command not found"
- Make sure you've added uv to your PATH
- Try restarting your terminal
- On macOS/Linux, run: `source ~/.bashrc` or `source ~/.zshrc`

### "No module named 'fastmcp'"
- Ensure you're in the project directory
- Run `uv sync` to install dependencies
- Use `uv run` instead of `python` directly

### Python version issues
- fastmcp requires Python 3.10+
- Check with: `python --version`
- Install a newer Python if needed

---

## Key Commands Reference

| Command | Purpose |
|---------|---------|
| `uv init` | Initialize a new project |
| `uv add <package>` | Add a dependency |
| `uv sync` | Install all dependencies |
| `uv run <script>` | Run a script with dependencies |
| `uv run python` | Start Python REPL with dependencies |

---

## What's Next?

Your mana base is prepared. You have:
- ✅ uv installed and configured
- ✅ A project with fastmcp and httpx dependencies
- ✅ A basic server structure verified

In the next phase, you'll craft your first **Sorcery**—a tool that fetches Magic: The Gathering card data from the Scryfall API.

*"The lands are tapped, the mana flows. Now, let us weave our first spell."*

---

**Phase Complete!** ✨

Your development environment is ready. Proceed to Phase 3 to create your first MCP tool.
