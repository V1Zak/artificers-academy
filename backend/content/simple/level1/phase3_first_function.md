# Your First Function

Now for the fun part -- writing a tool that an AI can actually use. Open `server.py` in your text editor and type in the following code.

## The Complete Code

```python
from fastmcp import FastMCP

# Create your server and give it a name
mcp = FastMCP("My First Server")

@mcp.tool()
def greet(name: str) -> str:
    """Say hello to someone by name."""
    return f"Hello, {name}! Welcome to the world of MCP."

@mcp.tool()
def add_numbers(a: float, b: float) -> float:
    """Add two numbers together and return the result."""
    return a + b
```

That is it -- just 12 lines of code. Let's break down what each part does.

## Line by Line

**`from fastmcp import FastMCP`** -- This loads the FastMCP library you installed earlier.

**`mcp = FastMCP("My First Server")`** -- This creates your server and gives it a name. The name shows up when clients connect.

**`@mcp.tool()`** -- This is a decorator. It tells FastMCP that the function below it should be available as a tool for the AI to call. Any function you put this decorator on becomes a tool.

**`def greet(name: str) -> str:`** -- A regular Python function. The `name: str` part tells the AI that this function expects text input. The `-> str` part says it returns text.

**`"""Say hello to someone by name."""`** -- This description (called a docstring) is very important. The AI reads this to understand what the tool does and when to use it. Always write clear, helpful descriptions.

**`def add_numbers(a: float, b: float) -> float:`** -- A second tool that takes two numbers and adds them. This shows that a server can have multiple tools.

## Key Takeaways

- Every tool is just a Python function with the `@mcp.tool()` decorator
- Type hints (like `str` and `float`) tell the AI what kind of input each tool expects
- The docstring tells the AI what the tool does -- write these carefully
- One server can have as many tools as you need

## Try Running It

Save the file and run:

```bash
uv run server.py
```

If there are no errors, your code is correct. The server will not do anything visible yet -- we will test it properly in the next step.
