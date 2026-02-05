# Phase 2: Inscribing the Tome

*"Before spells can be catalogued, the library must be constructed."*

---

## Creating the Spell Archive Project

Let's build the foundation for your filesystem MCP server. We'll create a project called **spell-archive** that provides safe access to a collection of spell files.

### Project Structure

Our finished project will look like:

```
spell-archive/
├── server.py           # Your MCP server
├── pyproject.toml      # Dependencies
└── archive/            # The spell collection (sandboxed)
    ├── fire-spells/
    │   ├── fireball.txt
    │   └── lightning-bolt.txt
    ├── ice-spells/
    │   ├── frost-nova.txt
    │   └── ice-storm.txt
    └── arcane-spells/
        ├── counterspell.txt
        └── ancestral-recall.txt
```

---

## Step 1: Initialize the Project

Open your terminal and create the project:

```bash
# Create project directory
mkdir spell-archive
cd spell-archive

# Initialize with uv (your Mana Source)
uv init

# Add dependencies
uv add "fastmcp[cli]"
```

Your `pyproject.toml` should now include `fastmcp`.

---

## Step 2: Create the Archive Directory

The archive directory is your **sanctioned realm**—the only place your MCP server can access. This is crucial for security.

```bash
# Create the archive structure
mkdir -p archive/fire-spells
mkdir -p archive/ice-spells
mkdir -p archive/arcane-spells
```

---

## Step 3: Populate the Archive

Create sample spell files. Each file contains the spell's description in a simple format.

### Fire Spells

**archive/fire-spells/fireball.txt:**
```
Name: Fireball
Mana Cost: {2}{R}
Type: Sorcery

Fireball deals X damage divided evenly, rounded down, among any number of targets.

Oracle Text:
This spell costs {1} more to cast for each target beyond the first.

---
A fundamental spell of pyromancy, taught in every academy of the flame arts.
```

**archive/fire-spells/lightning-bolt.txt:**
```
Name: Lightning Bolt
Mana Cost: {R}
Type: Instant

Lightning Bolt deals 3 damage to any target.

Oracle Text:
The sky rends, and fire descends.

---
The most efficient damage spell ever printed. A true classic.
```

### Ice Spells

**archive/ice-spells/frost-nova.txt:**
```
Name: Frost Nova
Mana Cost: {1}{U}{U}
Type: Sorcery

Tap all creatures target opponent controls. Those creatures don't untap during their controller's next untap step.

Oracle Text:
"The cold brings clarity—and stillness."

---
A powerful crowd control spell favored by frost mages.
```

**archive/ice-spells/ice-storm.txt:**
```
Name: Ice Storm
Mana Cost: {1}{G}{G}
Type: Sorcery

Destroy target land.

Oracle Text:
The storm cares not for boundaries or borders.

---
An ancient spell from the early days of the multiverse.
```

### Arcane Spells

**archive/arcane-spells/counterspell.txt:**
```
Name: Counterspell
Mana Cost: {U}{U}
Type: Instant

Counter target spell.

Oracle Text:
"Your spell? I think not."

---
The definition of blue magic. Simple, elegant, devastating.
```

**archive/arcane-spells/ancestral-recall.txt:**
```
Name: Ancestral Recall
Mana Cost: {U}
Type: Instant

Target player draws three cards.

Oracle Text:
Knowledge is the ultimate power.

---
One of the Power Nine. Banned in most formats for good reason.
```

---

## Step 4: Create the Server Skeleton

Create `server.py` with the basic FastMCP setup:

```python
from fastmcp import FastMCP
import os
from pathlib import Path

# Create the server - The Spell Archive
mcp = FastMCP("Spell Archive")

# Define the archive root - our sanctioned realm
# Use absolute path to prevent any path manipulation
ARCHIVE_ROOT = Path(__file__).parent / "archive"


if __name__ == "__main__":
    mcp.run()
```

This sets up:
1. **FastMCP instance** named "Spell Archive"
2. **ARCHIVE_ROOT** as the absolute path to the archive directory

---

## Step 5: Verify the Setup

Test that everything is in place:

```bash
# Check the structure
ls -la archive/
ls -la archive/fire-spells/
ls -la archive/ice-spells/
ls -la archive/arcane-spells/

# Verify server runs (it won't do much yet)
uv run python server.py
```

Press `Ctrl+C` to stop the server after verifying it starts without errors.

---

## Understanding the Security Model

Notice how we define `ARCHIVE_ROOT`:

```python
ARCHIVE_ROOT = Path(__file__).parent / "archive"
```

This gives us an **absolute path** based on where `server.py` lives. Key security principles:

1. **Absolute paths** - No ambiguity about where files are
2. **Single root** - All access flows through one controlled directory
3. **Path validation** - We'll add checks in Phase 3 to prevent escaping this root

---

## The Pathlib Advantage

We use Python's `pathlib` instead of string manipulation for paths:

```python
# Good - using pathlib
from pathlib import Path
archive = Path(__file__).parent / "archive"

# Avoid - string manipulation
archive = os.path.dirname(__file__) + "/archive"
```

Benefits of `pathlib`:
- Cross-platform (works on Windows, Mac, Linux)
- Cleaner syntax with `/` operator
- Built-in methods for validation
- Object-oriented design

---

## Project Checklist

Before proceeding, verify you have:

- [ ] `spell-archive/` directory created
- [ ] `pyproject.toml` with `fastmcp` dependency
- [ ] `archive/` directory with three subdirectories
- [ ] At least 2 spell files in each category
- [ ] `server.py` with FastMCP setup and ARCHIVE_ROOT defined

---

## What's Next?

Your library is built and stocked with spell scrolls. In Phase 3, you'll create your first Resource—a directory listing enchantment that lets Claude browse the archive's categories.

*"The shelves are labeled, the scrolls are filed. Now we must create the index."*

---

**Phase Complete!**

Your Spell Archive structure is ready. Proceed to Phase 3 to create the cataloging resource.
