# Project Setup

Let's create a new project for your file access server. This server will let an AI browse and read files from a specific folder on your computer.

## Step 1: Create the Project

Open your terminal and run:

```bash
mkdir file-server
cd file-server
uv init
uv add "fastmcp[cli]"
```

## Step 2: Create Sample Files

Your server needs some files to serve. Let's create a `documents` folder with a few sample files:

```bash
mkdir documents
```

Now create three text files inside the `documents` folder. You can use any text editor to create these:

**documents/welcome.txt:**
```
Welcome to the File Server!
This is a sample document that demonstrates how MCP resources work.
```

**documents/recipes.txt:**
```
Simple Pasta Recipe
1. Boil water and cook pasta for 10 minutes
2. Heat olive oil in a pan
3. Add garlic and cook for 1 minute
4. Toss pasta with the oil and garlic
5. Add salt, pepper, and parmesan cheese
```

**documents/notes.txt:**
```
Project Ideas
- Build a weather dashboard
- Create a personal budget tracker
- Make a recipe collection app
```

## Step 3: Start Your Server File

Create `server.py` and add the basic structure:

```python
from pathlib import Path
from fastmcp import FastMCP

mcp = FastMCP("File Server")

# This is the folder we will allow the AI to access
DOCS_DIR = Path(__file__).parent / "documents"
```

Let's break this down:

- **`from pathlib import Path`** -- Python's built-in way to work with file paths safely
- **`Path(__file__).parent / "documents"`** -- This finds the `documents` folder relative to your `server.py` file, no matter where you run the command from

## Your Project Structure

```
file-server/
  pyproject.toml
  server.py
  documents/
    welcome.txt
    recipes.txt
    notes.txt
```

## Why a Fixed Folder?

We only let the AI access files inside the `documents` folder. This is a safety measure. You would never want to give an AI unrestricted access to your entire computer. By limiting access to one folder, you stay in control of what data is shared.

In the next step, you will add a resource that lists all the files in this folder.
