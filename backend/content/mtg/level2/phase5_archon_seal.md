# Phase 5: The Archon's Seal

*"The archive is complete. Now we bind it to the Planeswalker."*

---

## Testing the Complete Server

Before connecting to Claude Desktop, let's thoroughly test our Spell Archive using the MCP Inspector.

### Launch the Inspector

```bash
cd spell-archive
npx @modelcontextprotocol/inspector uv run python server.py
```

Open your browser to the URL shown (usually `http://localhost:5173`).

---

## Testing All Resources

### Test 1: List Categories

In the Resources tab, find and click `archive://categories`.

**Expected output:**
```
# Spell Archive Categories

- arcane-spells (2 spells)
- fire-spells (2 spells)
- ice-spells (2 spells)
```

### Test 2: Browse a Category

Access `archive://spells/fire-spells`.

**Expected output:**
```
# Spells in fire-spells

- fireball
- lightning-bolt
```

### Test 3: Read a Spell

Access `archive://spell/fire-spells/fireball`.

**Expected output:**
```
Name: Fireball
Mana Cost: {2}{R}
Type: Sorcery
...
```

### Test 4: Security Check

Try to access `archive://spell/../../../etc/passwd`.

**Expected output:**
```
Access denied. Path traversal detected. The wards hold firm.
```

The wards are working.

---

## Connecting to Claude Desktop

Now let's connect your Spell Archive to Claude Desktop.

### Step 1: Find Your Server Path

Get the absolute path to your server:

```bash
# On Mac/Linux
cd spell-archive
pwd
# Example output: /Users/yourname/spell-archive
```

### Step 2: Configure Claude Desktop

Open Claude Desktop's configuration file:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add your server configuration:

```json
{
  "mcpServers": {
    "spell-archive": {
      "command": "uv",
      "args": [
        "run",
        "python",
        "/full/path/to/spell-archive/server.py"
      ]
    }
  }
}
```

Replace `/full/path/to/spell-archive/` with your actual path.

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to load the new configuration.

### Step 4: Verify Connection

In Claude Desktop, you should see a tools icon indicating MCP servers are connected. You can ask Claude:

> "What spell categories are in the archive?"

Claude should use your resources to answer!

---

## Example Conversations

Try these prompts with Claude:

### Browse the Archive
> "Show me all the spell categories in the archive."

### Find Specific Spells
> "What fire spells do you have access to?"

### Read a Spell
> "Read me the Counterspell from the archive."

### Compare Spells
> "Compare Lightning Bolt and Fireball from the archive."

---

## Level 2 Complete!

Congratulations, Artificer! You have mastered:

### Key Concepts Learned

1. **Resources vs Tools**
   - Tools perform actions
   - Resources provide data

2. **URI Design**
   - Protocol://path format
   - Template parameters with `{name}`
   - Hierarchical resource organization

3. **File System Security**
   - Path traversal prevention
   - Absolute path validation
   - Sandboxed directories

4. **Best Practices**
   - Use `pathlib` for paths
   - Comprehensive error handling
   - Clear docstrings for discoverability

---

## Your Spell Archive Summary

You built a server with three resources:

| URI | Purpose |
|-----|---------|
| `archive://categories` | List all spell categories |
| `archive://spells/{category}` | List spells in a category |
| `archive://spell/{category}/{name}` | Read a specific spell |

---

## Beyond the Archive

Your filesystem MCP server patterns can be applied to many use cases:

- **Documentation servers** - Expose markdown docs to Claude
- **Configuration managers** - Let Claude read (not write) config files
- **Log viewers** - Provide safe access to log files
- **Code browsers** - Let Claude explore codebases

The key is always: **controlled, safe access** through well-defined resources.

---

## What Awaits in Level 3?

You've mastered local data access. But what about data that lives *beyond* your filesystem? In **Level 3: The Aether**, you'll learn to:

- Connect to external APIs (weather, news, and more)
- Handle API authentication securely
- Implement caching to respect rate limits
- Build multi-tool servers for complex integrations

*"Your creations access local knowledge. Soon they will reach across the planes themselves."*

---

## Quick Reference

### Resource Pattern
```python
@mcp.resource("protocol://path/{parameter}")
def resource_function(parameter: str) -> str:
    """Docstring is required!"""
    return "Content"
```

### Security Pattern
```python
def is_safe_path(base: Path, requested: Path) -> bool:
    return requested.resolve().is_relative_to(base.resolve())
```

### File Reading Pattern
```python
content = path.read_text(encoding="utf-8")
```

---

**Level Complete!**

You have earned the rank of **Archive Keeper**. Your Spell Archive stands as testament to your mastery of MCP Resources.

*"Knowledge, properly guarded and freely shared. This is the way of the true Artificer."*
