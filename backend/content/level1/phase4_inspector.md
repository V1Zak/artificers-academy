# Phase 4: Summoning the Inspector

*"Before deploying to the battlefield, every spell must be tested in the proving grounds."*

---

## What is the MCP Inspector?

The **MCP Inspector** is a debugging tool that lets you:

- See exactly what tools your server exposes
- Test tool calls with custom inputs
- View the responses your server returns
- Debug issues before connecting to Claude

Think of it as a controlled testing chamber where you can safely examine your spells.

---

## Launching the Inspector

The Inspector comes bundled with `fastmcp`. Run it with:

```bash
uv run fastmcp dev server.py
```

This will:
1. Start your MCP server
2. Launch the Inspector web interface
3. Open your browser automatically (or show you a URL)

You should see output like:

```
Starting MCP Inspector...
Server running at http://localhost:5173
```

---

## The Inspector Interface

When the Inspector opens, you'll see several panels:

### 📋 Tools Panel
Lists all the tools your server exposes. You should see:
- `search_card` - Your card search sorcery
- `random_card` - Your random card spell

Click on a tool to see its:
- **Description** (your docstring)
- **Parameters** (with types)
- **Schema** (the JSON schema Claude uses)

### 🧪 Test Panel
Where you can invoke tools manually:
1. Select a tool from the list
2. Fill in the parameters
3. Click "Execute" or "Run"
4. See the response

### 📜 Logs Panel
Shows the raw JSON-RPC messages flowing between the Inspector and your server. Useful for debugging protocol issues.

---

## Testing Your Sorceries

### Test 1: search_card

1. Click on `search_card` in the tools list
2. In the parameter field, enter: `Lightning Bolt`
3. Click Execute

You should see a response like:

```
**Lightning Bolt** {R}
Instant

Lightning Bolt deals 3 damage to any target.
```

### Test 2: Fuzzy Matching

Try searching with a typo:

1. Enter: `Ligntning bolt` (misspelled)
2. Click Execute

Scryfall's fuzzy matching should still find the card!

### Test 3: Not Found

Test the error handling:

1. Enter: `xyzzy card that doesnt exist`
2. Click Execute

You should see your friendly error message.

### Test 4: random_card

1. Click on `random_card`
2. No parameters needed—just click Execute
3. See what card you discover!

---

## What Claude Sees

When Claude connects to your server, it receives a **manifest**—a description of your tools. The Inspector shows you exactly what this looks like.

Look at the **Schema** tab for `search_card`:

```json
{
  "name": "search_card",
  "description": "Search for a Magic: The Gathering card by name.\n\nReturns the card's name, mana cost, type, and oracle text.\nUses fuzzy matching, so partial names and typos are okay.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "card_name": {
        "type": "string",
        "description": "The name of the card to search for"
      }
    },
    "required": ["card_name"]
  }
}
```

This is why **docstrings matter**! Claude reads this description to decide when to use your tool.

---

## Common Issues and Fixes

### "Connection refused" or server not starting

```bash
# Make sure you're in the project directory
cd mtg-oracle-server

# Try running with verbose output
uv run fastmcp dev server.py --verbose
```

### Tools not appearing

Check that your server file:
- Has the `@mcp.tool()` decorator
- Has no syntax errors
- Runs without exceptions

Try running directly first:
```bash
uv run python server.py
```

### "Module not found" errors

```bash
# Ensure dependencies are installed
uv sync

# Try reinstalling
uv add fastmcp httpx --reinstall
```

### Slow responses

Scryfall has rate limits. If you're testing rapidly:
- Wait a moment between tests
- Check your internet connection

---

## Inspector Tips

### Keyboard Shortcuts
- `Ctrl+Enter` - Execute the current tool
- `Ctrl+L` - Clear the logs

### JSON Mode
Some tools return complex data. Use the "JSON" view toggle to see raw responses.

### Multiple Servers
You can run multiple Inspector sessions for different servers—useful when building complex systems.

---

## Verification Checklist

Before proceeding to the final phase, confirm:

- [ ] Inspector launches successfully
- [ ] Both tools appear in the tools list
- [ ] `search_card` returns correct card data
- [ ] Fuzzy matching works with typos
- [ ] Error handling works for not-found cards
- [ ] `random_card` returns random cards
- [ ] Docstrings appear correctly in the Schema

---

## Behind the Scenes

The Inspector communicates with your server using the exact same protocol Claude uses:

1. **Initialize** - Handshake and capability exchange
2. **List Tools** - Request available tools
3. **Call Tool** - Invoke a specific tool with parameters
4. **Response** - Receive the tool's output

When everything works in the Inspector, it will work with Claude.

---

## What's Next?

Your spells have been tested and proven. Now comes the moment of truth—connecting your server to Claude Desktop and witnessing the magic firsthand.

*"The proving grounds have accepted your craft. Now, face the true test."*

---

**Phase Complete!** ✨

Your server passes all tests. Proceed to Phase 5 for the Grand Summoning—connecting to Claude Desktop.
