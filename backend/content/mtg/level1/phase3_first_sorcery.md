# Phase 3: Crafting Your First Sorcery

*"Every great mage remembers their first spell. Today, you craft yours."*

---

## The Scryfall API: Your Oracle Source

[Scryfall](https://scryfall.com) is the premier Magic: The Gathering card database. Their free API provides access to every card ever printed—perfect for our Oracle.

**API Endpoint:** `https://api.scryfall.com/cards/named`

**Parameters:**
- `fuzzy` - Fuzzy card name search (forgiving of typos)
- `exact` - Exact card name match

---

## The Anatomy of a Tool (Sorcery)

In fastmcp, a tool is simply a Python function decorated with `@mcp.tool()`. The magic comes from:

1. **The decorator** - Registers the function as an MCP tool
2. **Type hints** - Tell Claude what parameters and return types to expect
3. **The docstring** - Describes what the tool does (Claude reads this!)

```python
@mcp.tool()
def tool_name(parameter: type) -> return_type:
    """Description that Claude will see and use to decide when to call this tool."""
    # Your logic here
    return result
```

---

## Crafting the search_card Sorcery

Open `server.py` and replace its contents with:

```python
from fastmcp import FastMCP
import httpx

# Create the server - your deck of spells
mcp = FastMCP("MTG Oracle")

# The Scryfall API base URL
SCRYFALL_API = "https://api.scryfall.com"


@mcp.tool()
def search_card(card_name: str) -> str:
    """
    Search for a Magic: The Gathering card by name.

    Returns the card's name, mana cost, type, and oracle text.
    Uses fuzzy matching, so partial names and typos are okay.

    Args:
        card_name: The name of the card to search for

    Examples:
        - "Black Lotus" returns the legendary Power Nine artifact
        - "Lightning Bolt" returns the classic red instant
        - "Counterspell" returns the iconic blue counterspell
    """
    # Query the Scryfall API with fuzzy matching
    response = httpx.get(
        f"{SCRYFALL_API}/cards/named",
        params={"fuzzy": card_name},
        timeout=10.0
    )

    # Handle errors gracefully
    if response.status_code == 404:
        return f"No card found matching '{card_name}'. Try a different spelling or card name."

    response.raise_for_status()
    card = response.json()

    # Extract the key information
    name = card.get("name", "Unknown")
    mana_cost = card.get("mana_cost", "N/A")
    type_line = card.get("type_line", "Unknown Type")
    oracle_text = card.get("oracle_text", "No oracle text available.")

    # Format the response
    return f"""**{name}** {mana_cost}
{type_line}

{oracle_text}"""


if __name__ == "__main__":
    mcp.run()
```

---

## Understanding the Code

### The Decorator
```python
@mcp.tool()
```
This registers `search_card` as an MCP tool. When Claude sees your server, it will know this function exists and can be called.

### The Docstring (Oracle Text)
```python
"""
Search for a Magic: The Gathering card by name.
...
"""
```
This is **crucial**. Claude reads this docstring to understand:
- What the tool does
- When to use it
- What parameters it needs

A good docstring is like good Oracle text—clear, concise, and informative.

### Type Hints
```python
def search_card(card_name: str) -> str:
```
- `card_name: str` tells Claude this parameter expects text
- `-> str` tells Claude the function returns text

### The API Call
```python
response = httpx.get(
    f"{SCRYFALL_API}/cards/named",
    params={"fuzzy": card_name},
    timeout=10.0
)
```
We use `httpx` to make HTTP requests. The `fuzzy` parameter allows for forgiving searches.

### Error Handling
```python
if response.status_code == 404:
    return f"No card found matching '{card_name}'..."
```
Graceful error handling ensures Claude gets useful feedback even when things go wrong.

---

## Testing Locally

Let's test the function directly before connecting it to Claude:

```bash
uv run python -c "
from server import search_card
print(search_card('black lotus'))
"
```

You should see:

```
**Black Lotus** {0}
Artifact

{T}, Sacrifice Black Lotus: Add three mana of any one color.
```

---

## Adding More Sorceries

Let's add a second tool to get random cards—sometimes you just want to discover something new:

```python
@mcp.tool()
def random_card() -> str:
    """
    Get a random Magic: The Gathering card.

    Perfect for discovering new cards or when you need inspiration.
    Returns the card's name, mana cost, type, and oracle text.
    """
    response = httpx.get(
        f"{SCRYFALL_API}/cards/random",
        timeout=10.0
    )

    response.raise_for_status()
    card = response.json()

    name = card.get("name", "Unknown")
    mana_cost = card.get("mana_cost", "N/A")
    type_line = card.get("type_line", "Unknown Type")
    oracle_text = card.get("oracle_text", "No oracle text available.")

    return f"""**{name}** {mana_cost}
{type_line}

{oracle_text}"""
```

Add this function to your `server.py` after the `search_card` function.

---

## The Complete Server

Your `server.py` should now look like this:

```python
from fastmcp import FastMCP
import httpx

# Create the server - your deck of spells
mcp = FastMCP("MTG Oracle")

# The Scryfall API base URL
SCRYFALL_API = "https://api.scryfall.com"


@mcp.tool()
def search_card(card_name: str) -> str:
    """
    Search for a Magic: The Gathering card by name.

    Returns the card's name, mana cost, type, and oracle text.
    Uses fuzzy matching, so partial names and typos are okay.

    Args:
        card_name: The name of the card to search for

    Examples:
        - "Black Lotus" returns the legendary Power Nine artifact
        - "Lightning Bolt" returns the classic red instant
        - "Counterspell" returns the iconic blue counterspell
    """
    response = httpx.get(
        f"{SCRYFALL_API}/cards/named",
        params={"fuzzy": card_name},
        timeout=10.0
    )

    if response.status_code == 404:
        return f"No card found matching '{card_name}'. Try a different spelling or card name."

    response.raise_for_status()
    card = response.json()

    name = card.get("name", "Unknown")
    mana_cost = card.get("mana_cost", "N/A")
    type_line = card.get("type_line", "Unknown Type")
    oracle_text = card.get("oracle_text", "No oracle text available.")

    return f"""**{name}** {mana_cost}
{type_line}

{oracle_text}"""


@mcp.tool()
def random_card() -> str:
    """
    Get a random Magic: The Gathering card.

    Perfect for discovering new cards or when you need inspiration.
    Returns the card's name, mana cost, type, and oracle text.
    """
    response = httpx.get(
        f"{SCRYFALL_API}/cards/random",
        timeout=10.0
    )

    response.raise_for_status()
    card = response.json()

    name = card.get("name", "Unknown")
    mana_cost = card.get("mana_cost", "N/A")
    type_line = card.get("type_line", "Unknown Type")
    oracle_text = card.get("oracle_text", "No oracle text available.")

    return f"""**{name}** {mana_cost}
{type_line}

{oracle_text}"""


if __name__ == "__main__":
    mcp.run()
```

---

## Validation Checklist

Before proceeding, verify your code has:

- [ ] `from fastmcp import FastMCP` import
- [ ] `@mcp.tool()` decorator on each tool function
- [ ] **Docstrings** on every tool (Claude needs these!)
- [ ] Type hints for parameters and return values
- [ ] Error handling for API failures
- [ ] `mcp.run()` in the main block

---

## What's Next?

You've crafted your first sorceries! But before we connect to Claude, we should test them properly using the **MCP Inspector**—a debugging tool that simulates what Claude sees.

*"A wise mage tests their spells in a controlled environment before casting them in battle."*

---

**Phase Complete!** ✨

Your MTG Oracle server has two powerful tools. Proceed to Phase 4 to test them with the MCP Inspector.
