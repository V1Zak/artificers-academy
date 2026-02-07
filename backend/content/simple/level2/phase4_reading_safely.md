# Reading Files Safely

The resource you built in the last step has a security problem. If someone requests `file://documents/../../etc/passwd`, the server would try to read a system file outside the documents folder. This is called a **path traversal attack**, and we need to prevent it.

## The Problem

The `..` characters in a file path mean "go up one folder." By chaining them together, someone could escape the documents folder and access anything on your computer. Here is what happens without protection:

```
documents + ../../etc/passwd = /etc/passwd  (a system file!)
```

## The Fix

We need to check that the final file path is still inside the allowed folder. Update your `read_document` resource:

```python
@mcp.resource("file://documents/{filename}")
def read_document(filename: str) -> str:
    """Read the contents of a specific document."""
    file_path = (DOCS_DIR / filename).resolve()

    # Security check: make sure the path is still inside our folder
    if not str(file_path).startswith(str(DOCS_DIR.resolve())):
        return "Access denied: that path is outside the allowed folder."

    if not file_path.exists():
        return f"File not found: {filename}"

    if not file_path.suffix == ".txt":
        return "Only .txt files can be read."

    return file_path.read_text()
```

## What Changed

1. **`.resolve()`** -- This converts the path to its absolute form and removes any `..` tricks. For example, `/docs/../etc/passwd` becomes `/etc/passwd`.

2. **`startswith` check** -- After resolving, we check if the path still begins with our documents folder. If someone tried `../../etc/passwd`, the resolved path would be `/etc/passwd`, which does not start with our documents folder, so the request is denied.

3. **File type check** -- We only allow `.txt` files to be read. This prevents access to other file types that might contain sensitive information.

## Adding a Search Tool

Let's also add a tool that searches within files:

```python
@mcp.tool()
def search_documents(query: str) -> str:
    """Search for a word or phrase across all documents. Returns matching lines."""
    results = []
    for file_path in sorted(DOCS_DIR.glob("*.txt")):
        content = file_path.read_text()
        for i, line in enumerate(content.splitlines(), 1):
            if query.lower() in line.lower():
                results.append(f"{file_path.name} (line {i}): {line.strip()}")

    if not results:
        return f"No matches found for '{query}'."

    return f"Found {len(results)} match(es):\n" + "\n".join(results)
```

This is a **tool** (not a resource) because searching is an action that requires processing, not just returning existing data.

## Important Principle

Always assume that inputs could be malicious. Validate everything, restrict access to only what is needed, and never trust file paths without checking them. This applies to any server you build, not just file servers.
