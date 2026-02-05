# Phase 3: The Cataloging Enchantment

*"To find knowledge, one must first know what knowledge exists."*

---

## Your First Resource: The Catalog

Now we'll create a Resource that lists the contents of your spell archive. This is fundamentally different from a Tool—instead of *doing* something, it *provides* something.

---

## The Directory Listing Resource

Open `server.py` and add the following resource:

```python
from fastmcp import FastMCP
import os
from pathlib import Path

# Create the server - The Spell Archive
mcp = FastMCP("Spell Archive")

# Define the archive root - our sanctioned realm
ARCHIVE_ROOT = Path(__file__).parent / "archive"


@mcp.resource("archive://categories")
def list_categories() -> str:
    """
    List all spell categories in the archive.

    Returns a formatted list of available spell categories,
    each representing a school of magic in the archive.
    """
    categories = []

    for item in ARCHIVE_ROOT.iterdir():
        if item.is_dir():
            # Count spells in this category
            spell_count = len(list(item.glob("*.txt")))
            categories.append(f"- {item.name} ({spell_count} spells)")

    if not categories:
        return "The archive is empty. No spell categories found."

    return "# Spell Archive Categories\n\n" + "\n".join(sorted(categories))


if __name__ == "__main__":
    mcp.run()
```

---

## Understanding the Resource

### The Decorator
```python
@mcp.resource("archive://categories")
```

This registers a resource at the URI `archive://categories`. When Claude (or the Inspector) requests this URI, the function is called.

### The Docstring
```python
"""
List all spell categories in the archive.
...
"""
```

Just like Tools, Resources need docstrings! They help Claude understand what the resource provides.

### The Return Value
```python
return "# Spell Archive Categories\n\n" + "\n".join(sorted(categories))
```

Resources return their content as strings. Here we return a markdown-formatted list.

---

## Adding a Category Browser

Now let's add a resource with a **URI template**—a dynamic resource that takes parameters:

```python
@mcp.resource("archive://spells/{category}")
def list_spells_in_category(category: str) -> str:
    """
    List all spells in a specific category.

    Args:
        category: The spell category to browse (e.g., 'fire-spells', 'ice-spells')

    Returns:
        A formatted list of spell names in the category.
    """
    category_path = ARCHIVE_ROOT / category

    # Security check: ensure the category exists and is a directory
    if not category_path.exists():
        return f"Category '{category}' not found in the archive."

    if not category_path.is_dir():
        return f"'{category}' is not a valid category."

    spells = []
    for spell_file in category_path.glob("*.txt"):
        # Remove .txt extension for display
        spell_name = spell_file.stem
        spells.append(f"- {spell_name}")

    if not spells:
        return f"No spells found in category '{category}'."

    return f"# Spells in {category}\n\n" + "\n".join(sorted(spells))
```

---

## How URI Templates Work

When you define:
```python
@mcp.resource("archive://spells/{category}")
def list_spells_in_category(category: str) -> str:
```

The `{category}` becomes a parameter. Examples:
- `archive://spells/fire-spells` → `category = "fire-spells"`
- `archive://spells/ice-spells` → `category = "ice-spells"`
- `archive://spells/arcane-spells` → `category = "arcane-spells"`

This is similar to URL routing in web frameworks!

---

## The Complete Server (So Far)

Your `server.py` should now look like:

```python
from fastmcp import FastMCP
import os
from pathlib import Path

# Create the server - The Spell Archive
mcp = FastMCP("Spell Archive")

# Define the archive root - our sanctioned realm
ARCHIVE_ROOT = Path(__file__).parent / "archive"


@mcp.resource("archive://categories")
def list_categories() -> str:
    """
    List all spell categories in the archive.

    Returns a formatted list of available spell categories,
    each representing a school of magic in the archive.
    """
    categories = []

    for item in ARCHIVE_ROOT.iterdir():
        if item.is_dir():
            spell_count = len(list(item.glob("*.txt")))
            categories.append(f"- {item.name} ({spell_count} spells)")

    if not categories:
        return "The archive is empty. No spell categories found."

    return "# Spell Archive Categories\n\n" + "\n".join(sorted(categories))


@mcp.resource("archive://spells/{category}")
def list_spells_in_category(category: str) -> str:
    """
    List all spells in a specific category.

    Args:
        category: The spell category to browse (e.g., 'fire-spells', 'ice-spells')

    Returns:
        A formatted list of spell names in the category.
    """
    category_path = ARCHIVE_ROOT / category

    if not category_path.exists():
        return f"Category '{category}' not found in the archive."

    if not category_path.is_dir():
        return f"'{category}' is not a valid category."

    spells = []
    for spell_file in category_path.glob("*.txt"):
        spell_name = spell_file.stem
        spells.append(f"- {spell_name}")

    if not spells:
        return f"No spells found in category '{category}'."

    return f"# Spells in {category}\n\n" + "\n".join(sorted(spells))


if __name__ == "__main__":
    mcp.run()
```

---

## Testing with the Inspector

Launch the MCP Inspector to test your resources:

```bash
npx @modelcontextprotocol/inspector uv run python server.py
```

In the Inspector:
1. Go to the **Resources** tab
2. You should see `archive://categories` listed
3. Click to read its contents
4. Try `archive://spells/fire-spells` to see spells in that category

---

## Validation Requirements

Your code must have:

- [ ] `from fastmcp import FastMCP` import
- [ ] `@mcp.resource()` decorator with valid URI
- [ ] Docstring on every resource function
- [ ] At least one resource with URI template (`{parameter}`)
- [ ] Proper error handling for missing categories

---

## Common Mistakes to Avoid

### 1. Invalid URI Format
```python
# Wrong - no protocol
@mcp.resource("categories")

# Correct - has protocol://
@mcp.resource("archive://categories")
```

### 2. Missing Docstring
```python
# Wrong - no docstring
@mcp.resource("archive://categories")
def list_categories() -> str:
    return "..."

# Correct - has docstring
@mcp.resource("archive://categories")
def list_categories() -> str:
    """List all spell categories."""
    return "..."
```

### 3. Template Parameter Mismatch
```python
# Wrong - parameter name doesn't match
@mcp.resource("archive://spells/{category}")
def list_spells(cat: str) -> str:  # 'cat' != 'category'
    ...

# Correct - names match
@mcp.resource("archive://spells/{category}")
def list_spells(category: str) -> str:
    ...
```

---

## Security Note

Notice we're not yet protecting against path traversal. A malicious request like:
```
archive://spells/../../etc
```

Could potentially list files outside our archive! In Phase 4, we'll add proper security validation.

---

## What's Next?

You've created resources that list your archive's contents. But Claude can only see *what* spells exist—not *read* them. In Phase 4, you'll add the ability to read individual spell files, complete with security protections.

*"The catalog reveals what knowledge exists. Now we must allow the knowledge to be read."*

---

**Phase Complete!**

You've created your first MCP resources. Proceed to Phase 4 to add file reading with security protections.
