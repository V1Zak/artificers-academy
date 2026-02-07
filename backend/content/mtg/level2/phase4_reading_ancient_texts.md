# Phase 4: Reading the Ancient Texts

*"With great access comes great responsibility. The wards must hold."*

---

## The File Reading Resource

Now we'll create the most powerful (and potentially dangerous) resource: one that reads actual file contents. This requires careful security considerations.

---

## The Security Challenge

Consider this attack:
```
archive://spell/fire-spells/../../etc/passwd
```

If we naively join paths, the `../..` could escape our archive and read system files!

### Path Traversal Prevention

We need **warding glyphs**—security checks that prevent escape:

```python
def is_safe_path(base_path: Path, requested_path: Path) -> bool:
    """
    Verify that requested_path stays within base_path.

    This is a warding glyph against path traversal attacks.
    """
    try:
        # Resolve to absolute path, following symlinks
        resolved = requested_path.resolve()
        base_resolved = base_path.resolve()

        # Check if the resolved path starts with the base path
        return resolved.is_relative_to(base_resolved)
    except (ValueError, RuntimeError):
        return False
```

This function:
1. Resolves all `..` and symlinks to get the true path
2. Checks if it's still within our archive
3. Returns `False` for any suspicious path

---

## The File Reader Resource

Add this to your `server.py`:

```python
def is_safe_path(base_path: Path, requested_path: Path) -> bool:
    """
    Verify that requested_path stays within base_path.

    This is a warding glyph against path traversal attacks.
    """
    try:
        resolved = requested_path.resolve()
        base_resolved = base_path.resolve()
        return resolved.is_relative_to(base_resolved)
    except (ValueError, RuntimeError):
        return False


@mcp.resource("archive://spell/{category}/{name}")
def read_spell(category: str, name: str) -> str:
    """
    Read the contents of a specific spell scroll.

    Args:
        category: The spell category (e.g., 'fire-spells')
        name: The spell name without extension (e.g., 'fireball')

    Returns:
        The full content of the spell scroll.

    Security:
        Path traversal is prevented by validation.
    """
    # Construct the file path
    spell_path = ARCHIVE_ROOT / category / f"{name}.txt"

    # Security check: prevent path traversal
    if not is_safe_path(ARCHIVE_ROOT, spell_path):
        return "Access denied. Path traversal detected. The wards hold firm."

    # Check if file exists
    if not spell_path.exists():
        return f"Spell '{name}' not found in category '{category}'."

    if not spell_path.is_file():
        return f"'{name}' is not a valid spell scroll."

    # Read and return the file contents
    try:
        content = spell_path.read_text(encoding="utf-8")
        return content
    except Exception as e:
        return f"Error reading spell scroll: {str(e)}"
```

---

## Understanding the Security Layers

Our file reader has multiple layers of protection:

### Layer 1: Path Construction
```python
spell_path = ARCHIVE_ROOT / category / f"{name}.txt"
```
We control the structure: category/name.txt

### Layer 2: Path Validation
```python
if not is_safe_path(ARCHIVE_ROOT, spell_path):
    return "Access denied..."
```
Reject any path that escapes our archive.

### Layer 3: Existence Check
```python
if not spell_path.exists():
    return f"Spell '{name}' not found..."
```
Only read files that actually exist.

### Layer 4: File Type Check
```python
if not spell_path.is_file():
    return f"'{name}' is not a valid spell scroll."
```
Don't try to "read" directories.

### Layer 5: Exception Handling
```python
try:
    content = spell_path.read_text(encoding="utf-8")
except Exception as e:
    return f"Error reading spell scroll: {str(e)}"
```
Handle unexpected errors gracefully.

---

## The Complete Server

Your `server.py` should now look like:

```python
from fastmcp import FastMCP
from pathlib import Path

# Create the server - The Spell Archive
mcp = FastMCP("Spell Archive")

# Define the archive root - our sanctioned realm
ARCHIVE_ROOT = Path(__file__).parent / "archive"


def is_safe_path(base_path: Path, requested_path: Path) -> bool:
    """
    Verify that requested_path stays within base_path.

    This is a warding glyph against path traversal attacks.
    """
    try:
        resolved = requested_path.resolve()
        base_resolved = base_path.resolve()
        return resolved.is_relative_to(base_resolved)
    except (ValueError, RuntimeError):
        return False


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


@mcp.resource("archive://spell/{category}/{name}")
def read_spell(category: str, name: str) -> str:
    """
    Read the contents of a specific spell scroll.

    Args:
        category: The spell category (e.g., 'fire-spells')
        name: The spell name without extension (e.g., 'fireball')

    Returns:
        The full content of the spell scroll.

    Security:
        Path traversal is prevented by validation.
    """
    spell_path = ARCHIVE_ROOT / category / f"{name}.txt"

    if not is_safe_path(ARCHIVE_ROOT, spell_path):
        return "Access denied. Path traversal detected. The wards hold firm."

    if not spell_path.exists():
        return f"Spell '{name}' not found in category '{category}'."

    if not spell_path.is_file():
        return f"'{name}' is not a valid spell scroll."

    try:
        content = spell_path.read_text(encoding="utf-8")
        return content
    except Exception as e:
        return f"Error reading spell scroll: {str(e)}"


if __name__ == "__main__":
    mcp.run()
```

---

## Testing the Security

Launch the Inspector and test:

### Valid Requests:
```
archive://spell/fire-spells/fireball
archive://spell/arcane-spells/counterspell
```

### Attack Attempts (should be blocked):
```
archive://spell/../../../etc/passwd
archive://spell/fire-spells/../../secrets
```

The wards should hold—returning "Access denied" for any traversal attempt.

---

## Validation Requirements

Your code must have:

- [ ] `is_safe_path()` function with path traversal protection
- [ ] `@mcp.resource()` with two template parameters
- [ ] Comprehensive docstring explaining security
- [ ] Error handling for missing files
- [ ] UTF-8 encoding specified for file reading

---

## Async Alternative

For production use with large files, consider async file reading:

```python
import aiofiles

@mcp.resource("archive://spell/{category}/{name}")
async def read_spell(category: str, name: str) -> str:
    """Read a spell asynchronously."""
    spell_path = ARCHIVE_ROOT / category / f"{name}.txt"

    if not is_safe_path(ARCHIVE_ROOT, spell_path):
        return "Access denied. Path traversal detected."

    if not spell_path.exists():
        return f"Spell not found."

    async with aiofiles.open(spell_path, "r", encoding="utf-8") as f:
        return await f.read()
```

This requires adding `aiofiles`:
```bash
uv add aiofiles
```

For our tutorial, synchronous reading is fine since spell files are small.

---

## Best Practices Summary

1. **Always use absolute paths** for your base directory
2. **Validate all paths** before reading
3. **Use `pathlib`** instead of string manipulation
4. **Handle errors gracefully** with informative messages
5. **Specify encoding** when reading text files
6. **Consider async** for large files or high throughput

---

## What's Next?

Your Spell Archive is complete! You have:
- Directory listing resources
- Category browsing
- Individual spell reading
- Security against path traversal

In Phase 5, you'll test the complete server and connect it to Claude Desktop.

*"The archive is sealed, the wards are set. The knowledge is ready to be shared."*

---

**Phase Complete!**

You've created a secure file reading resource. Proceed to Phase 5 to test and deploy your Spell Archive.
