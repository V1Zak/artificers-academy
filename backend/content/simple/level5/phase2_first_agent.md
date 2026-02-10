# Your First Agent Tool

## What We're Building

You'll create a tool called `review_code` that uses an AI helper to review code files and give helpful feedback.

## Project Setup

Create a new folder and set it up:

```bash
mkdir code-reviewer
cd code-reviewer
uv init
uv add "fastmcp[cli]"
```

## Building the Tool

Create a file called `server.py`:

```python
from fastmcp import FastMCP
from pathlib import Path

# Create our MCP server
mcp = FastMCP("Code Reviewer")

@mcp.tool()
async def review_code(file_path: str, focus: str = "general") -> str:
    """
    Review a code file and provide helpful feedback.

    This tool reads your code and gives you suggestions for improvement.

    file_path: The code file to review
    focus: What to focus on - "general", "security", or "performance"
    """
    # First, check if the file exists
    path = Path(file_path)
    if not path.exists():
        return f"Error: Can't find file at {file_path}"

    # Read the code
    with open(path, 'r') as f:
        code = f.read()

    # In a real version, this would call an AI helper
    # For now, we'll return a helpful message
    return f"""
Code Review for {file_path}
===========================

The file has {len(code)} characters of code.
Focus area: {focus}

[In production, an AI helper would analyze the code and provide:
- What the code does well
- Potential problems
- Suggestions for improvement
- Security concerns if focus is "security"
- Performance tips if focus is "performance"]

Next step: Connect this to a real AI helper using the Agent SDK!
"""

# Run the server
if __name__ == "__main__":
    mcp.run()
```

## Understanding the Code

Let's break it down:

**Import what we need:**
```python
from fastmcp import FastMCP
from pathlib import Path
```
- `FastMCP` - The library that makes MCP servers
- `Path` - Helps us work with files safely

**Create the server:**
```python
mcp = FastMCP("Code Reviewer")
```
This creates your MCP server with a name.

**The @mcp.tool() decorator:**
```python
@mcp.tool()
async def review_code(...):
```
This tells MCP "this function is a tool that AI can use."

**The docstring (the text in triple quotes):**
This is super important! The AI reads this to understand what your tool does.

**Check if the file exists:**
```python
if not path.exists():
    return f"Error: Can't find file at {file_path}"
```
Always check inputs - don't assume files exist!

**Read the file:**
```python
with open(path, 'r') as f:
    code = f.read()
```
This safely reads the code file.

## Testing Your Tool

Start the server:
```bash
uv run server.py
```

In another terminal, test it with the Inspector:
```bash
npx @modelcontextprotocol/inspector uv run server.py
```

Try it:
1. Click on the `review_code` tool
2. Enter a file path (like `server.py`)
3. Choose a focus (like `security`)
4. Click "Run"

You should see the review output!

## What's Next?

Right now, this tool just reads files. In the next phase, you'll learn how to actually call AI helpers from your code to do real analysis!

**Remember:** The AI helper pattern is:
1. Get input from the user
2. Prepare information for the AI
3. Call the AI helper
4. Return the results

You've got steps 1, 2, and 4 done. Next up: step 3!
