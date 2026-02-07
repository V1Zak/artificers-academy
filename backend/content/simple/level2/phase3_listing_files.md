# Listing Files

Now let's add your first resource -- one that tells the AI which files are available to read.

## Adding the Resource

Open `server.py` and add this below the `DOCS_DIR` line:

```python
@mcp.resource("file://documents")
def list_documents() -> str:
    """List all available text files in the documents folder."""
    files = sorted(DOCS_DIR.glob("*.txt"))
    if not files:
        return "No documents found."

    file_list = []
    for f in files:
        size = f.stat().st_size
        file_list.append(f"- {f.name} ({size} bytes)")

    return "Available documents:\n" + "\n".join(file_list)
```

## How This Is Different From a Tool

Notice the decorator is `@mcp.resource()` instead of `@mcp.tool()`. The key differences:

- **A resource has a URI** -- here it is `file://documents`. The AI accesses the resource by requesting this address.
- **Resources are read-only** -- this function only looks at files, it never changes or deletes anything.
- **Resources are expected to be safe** -- the AI (and the user) can trust that calling a resource will not have any side effects.

## What the Code Does

1. **`DOCS_DIR.glob("*.txt")`** -- Finds all files ending in `.txt` inside the documents folder
2. **`sorted(...)`** -- Puts them in alphabetical order
3. **`f.stat().st_size`** -- Gets the file size in bytes
4. **Returns a formatted list** -- Each file is shown with its name and size

When the AI requests the `file://documents` resource, it gets back something like:

```
Available documents:
- notes.txt (95 bytes)
- recipes.txt (215 bytes)
- welcome.txt (89 bytes)
```

## Adding a Dynamic Resource

You can also create resources with variable parts in the URI. Add this:

```python
@mcp.resource("file://documents/{filename}")
def read_document(filename: str) -> str:
    """Read the contents of a specific document."""
    file_path = DOCS_DIR / filename

    if not file_path.exists():
        return f"File not found: {filename}"

    return file_path.read_text()
```

The `{filename}` part is a placeholder. When the AI requests `file://documents/recipes.txt`, FastMCP fills in `filename` with `recipes.txt` and calls your function.

## Test It

Run your server to check for errors:

```bash
uv run server.py
```

No errors means you are ready to add security in the next step.
