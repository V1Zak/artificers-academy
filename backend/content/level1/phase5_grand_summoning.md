# Phase 5: The Grand Summoning

*"The moment has arrived. Your deck is complete, your spells tested. Now, summon the Planeswalker."*

---

## Connecting to Claude Desktop

Claude Desktop is Anthropic's official desktop application. It supports MCP servers natively, making it the perfect Host for your MTG Oracle.

### Step 1: Install Claude Desktop

If you haven't already:

1. Visit [claude.ai/download](https://claude.ai/download)
2. Download the version for your operating system
3. Install and sign in with your Anthropic account

---

### Step 2: Locate Your Server Path

You need the **absolute path** to your server file. Find it with:

```bash
# macOS/Linux
pwd
# Example output: /Users/yourname/projects/mtg-oracle-server

# Windows (PowerShell)
Get-Location
# Example output: C:\Users\yourname\projects\mtg-oracle-server
```

Your server path will be something like:
- macOS: `/Users/yourname/projects/mtg-oracle-server/server.py`
- Windows: `C:\Users\yourname\projects\mtg-oracle-server\server.py`

---

### Step 3: Configure Claude Desktop

Claude Desktop stores its MCP configuration in a JSON file.

#### macOS
Open the config file:
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

If the file doesn't exist, create it.

#### Windows
Open the config file at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

#### The Configuration

Add your server to the `mcpServers` section:

```json
{
  "mcpServers": {
    "mtg-oracle": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "/FULL/PATH/TO/mtg-oracle-server",
        "server.py"
      ]
    }
  }
}
```

**Important:** Replace `/FULL/PATH/TO/mtg-oracle-server` with your actual path!

#### Example (macOS)
```json
{
  "mcpServers": {
    "mtg-oracle": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "/Users/alex/projects/mtg-oracle-server",
        "server.py"
      ]
    }
  }
}
```

#### Example (Windows)
```json
{
  "mcpServers": {
    "mtg-oracle": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "C:\\Users\\alex\\projects\\mtg-oracle-server",
        "server.py"
      ]
    }
  }
}
```

---

### Step 4: Restart Claude Desktop

After saving the configuration:

1. **Completely quit** Claude Desktop (not just close the window)
   - macOS: `Cmd+Q` or Claude menu → Quit
   - Windows: Right-click tray icon → Exit
2. **Relaunch** Claude Desktop

---

### Step 5: Verify the Connection

Look for the **MCP tools icon** (🔧 or hammer icon) in the Claude Desktop interface. Click it to see connected servers.

You should see:
- **mtg-oracle** with 2 tools available
  - `search_card`
  - `random_card`

If you don't see it, check the **Troubleshooting** section below.

---

## The Grand Test

Now, the moment of truth. Start a new conversation with Claude and try:

> "What does the card Black Lotus do?"

Claude should:
1. Recognize this is a Magic: The Gathering question
2. Decide to use your `search_card` tool
3. Call the tool with "Black Lotus"
4. Receive the card data from Scryfall
5. Craft a response using that information

You might see Claude's response like:

> "Black Lotus is one of the most famous and valuable cards in Magic: The Gathering! Here's what it does:
>
> **Black Lotus** {0}
> Artifact
>
> {T}, Sacrifice Black Lotus: Add three mana of any one color.
>
> This card is part of the legendary 'Power Nine' and is known for providing an explosive mana advantage..."

---

## More Things to Try

### Compare Cards
> "Compare Lightning Bolt and Shock"

Claude will search for both cards and analyze them.

### Discover New Cards
> "Show me a random Magic card"

Claude uses your `random_card` tool.

### Rules Questions
> "Can Counterspell target a creature?"

Claude will look up Counterspell and reason about the rules.

### Deck Building
> "What are some good blue counterspells?"

Claude might search for multiple cards to answer.

---

## Troubleshooting

### Server not appearing in Claude Desktop

1. **Check the config file path** - Make sure you edited the right file
2. **Validate JSON** - Use a JSON validator to check for syntax errors
3. **Check the path** - Ensure the directory path is correct and absolute
4. **Restart properly** - Fully quit and relaunch Claude Desktop

### "Tool call failed" errors

1. **Check your server runs locally:**
   ```bash
   cd /path/to/mtg-oracle-server
   uv run server.py
   ```
2. **Check internet connection** - Scryfall API needs network access
3. **Check for exceptions** - Run the Inspector to see detailed errors

### Claude doesn't use the tool

Claude decides when to use tools based on context. Try being more explicit:

> "Use your MTG Oracle to look up Black Lotus"

### Finding logs

Claude Desktop logs can help diagnose issues:

- **macOS:** `~/Library/Logs/Claude/`
- **Windows:** `%APPDATA%\Claude\logs\`

---

## Congratulations, Planeswalker! 🎉

You have successfully:

1. ✅ Learned the architecture of MCP (Hosts, Clients, Servers)
2. ✅ Set up your development environment with uv
3. ✅ Created an MCP server with fastmcp
4. ✅ Built tools that query external APIs
5. ✅ Tested your server with the Inspector
6. ✅ Connected your server to Claude Desktop

**You are now an MCP Artificer.**

---

## What's Next?

Your journey has just begun. In future levels, you'll learn:

- **Level 2: The Archive** - Build a filesystem server for reading and writing files
- **Level 3: The Aether** - Connect to more external APIs with async operations
- **Level 4: The Blind Eternities** - Deploy your server to production

---

## Quick Reference Card

### Server Structure
```python
from fastmcp import FastMCP

mcp = FastMCP("Server Name")

@mcp.tool()
def my_tool(param: str) -> str:
    """Docstring that Claude reads."""
    return result

if __name__ == "__main__":
    mcp.run()
```

### Claude Desktop Config
```json
{
  "mcpServers": {
    "server-name": {
      "command": "uv",
      "args": ["run", "--directory", "/path/to/server", "server.py"]
    }
  }
}
```

### Useful Commands
```bash
uv init                    # Create new project
uv add fastmcp            # Add dependency
uv run server.py          # Run server
uv run fastmcp dev server.py  # Launch Inspector
```

---

**Level 1 Complete!** 🏆

*"You have crossed the threshold from student to Artificer. The multiverse awaits your creations."*
