# Phase 1: The Forbidden Stacks

*"Within these ancient shelves lies knowledge beyond mere spells—the very essence of information itself."*

---

## Beyond Sorceries: The Nature of Permanents

In Level 1, you mastered **Tools**—the Sorceries of MCP. You learned to create functions that Claude can invoke to perform actions. But Sorceries are ephemeral; they flash into existence, do their work, and vanish.

Now you will learn of **Resources**—the Permanents of the MCP multiverse. Unlike Sorceries, Permanents persist. They represent data that exists independently of any action, waiting to be accessed.

---

## Tools vs Resources: A Fundamental Distinction

| Aspect | Tools (Sorceries) | Resources (Permanents) |
|--------|-------------------|------------------------|
| **Purpose** | Execute actions | Provide data |
| **Invocation** | Called with parameters | Accessed via URI |
| **Nature** | Do something | Be something |
| **MTG Analog** | Instant/Sorcery | Artifact/Enchantment/Land |
| **Example** | `search_card("Black Lotus")` | `file://spells/fireball.txt` |

Think of it this way:
- A **Tool** is like casting Lightning Bolt—an action that happens
- A **Resource** is like having a Howling Mine on the battlefield—persistent access to something

---

## The Anatomy of a Resource

In fastmcp, resources are created with the `@mcp.resource()` decorator:

```python
@mcp.resource("protocol://path")
def get_resource() -> str:
    """Return the resource content."""
    return "The content of your resource"
```

The key difference from tools:
1. **URI Required** - Every resource has a unique address
2. **Read-Only** - Resources provide data, they don't modify state
3. **Discoverable** - Clients can list all available resources

---

## Understanding URIs (Universal Resource Identifiers)

A URI is the "address" of your resource. It follows the pattern:

```
protocol://path/to/resource
```

Examples:
- `file://documents/readme.txt` - A specific file
- `archive://spells/fire` - Category of spells
- `config://settings` - Configuration data

### URI Templates

For dynamic resources, you can use **templates** with parameters:

```python
@mcp.resource("archive://spells/{category}")
def list_spells(category: str) -> str:
    """List all spells in a category."""
    # category is extracted from the URI
    return f"Spells in {category}..."
```

When Claude accesses `archive://spells/fire`, the `category` parameter becomes `"fire"`.

---

## Why File Access Through MCP?

You might wonder: "Can't Claude just ask me to read files directly?"

The power of MCP resources for file access:

1. **Controlled Access** - You decide exactly which files/directories are exposed
2. **Security** - Prevent directory traversal attacks (`../../../etc/passwd`)
3. **Abstraction** - Present files in a structured, meaningful way
4. **Context** - Claude knows what files are available before asking

Imagine giving Claude access to a "spell archive"—a directory of text files containing spell descriptions. With resources, Claude can:
- Browse available categories
- Read specific spell files
- Understand the structure without guessing paths

---

## The Archive We'll Build

In this level, you'll create a **Spell Archive** server that provides:

1. **Directory Listing Resource** - Browse spell categories
2. **File Reading Resource** - Read individual spell files
3. **Safe Path Handling** - Prevent security issues

The final server will look like:

```
archive://spells              → List all categories
archive://spells/{category}   → List spells in a category
archive://spell/{category}/{name} → Read a specific spell
```

---

## Security: The Warding Glyphs

When dealing with file access, security is paramount. The most common attack is **path traversal**:

```
# Attacker tries to access:
archive://spell/../../etc/passwd
```

Without protection, this could read sensitive system files!

We'll implement **warding glyphs**—validation that ensures paths stay within your sanctioned directory. The rules:

1. **No `..`** - Reject any path containing parent directory references
2. **Absolute paths only** - Convert all paths to absolute before checking
3. **Boundary check** - Verify the final path is within your archive directory

---

## Key Concepts to Remember

| Concept | MTG Metaphor | Description |
|---------|--------------|-------------|
| Resource | Permanent | Persistent data accessible by URI |
| URI | Summoning Name | The unique address of a resource |
| URI Template | Variable Mana Cost | URIs with dynamic parameters |
| Path Traversal | Counterspell Attempt | Malicious attempt to access forbidden files |
| Warding Glyphs | Protection Enchantment | Security validation on paths |

---

## What You'll Need

Before proceeding to Phase 2, ensure you have:

- Completed Level 1 (understanding of FastMCP basics)
- Python 3.10+ installed
- `uv` package manager ready
- A terminal/command line

---

## What's Next?

In the next phase, you'll set up your Spell Archive project—creating the directory structure and sample files that your MCP server will expose. You'll prepare the foundation upon which your Resources will be built.

*"A well-organized library is a well-defended library."*

---

**Phase Complete!**

You now understand the difference between Tools and Resources in MCP. Proceed to Phase 2 to create your Archive project structure.
