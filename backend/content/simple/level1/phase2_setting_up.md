# Setting Up Your Tools

Before we write any code, we need to install two things: **Python** and a tool called **uv** that helps manage Python projects.

## Step 1: Check for Python

Open your terminal (Terminal on Mac, Command Prompt or PowerShell on Windows) and type:

```bash
python3 --version
```

You should see something like `Python 3.12.x`. If you get an error, download Python from [python.org](https://www.python.org/downloads/) and install it. We need version 3.10 or higher.

## Step 2: Install uv

**uv** is a modern tool for managing Python projects. It handles downloading packages, creating isolated environments, and running your code. Install it by running:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

On Windows, use:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

After installation, close and reopen your terminal, then verify it worked:

```bash
uv --version
```

## Step 3: Create Your Project

Now let's create a new project. Run these commands one at a time:

```bash
mkdir my-first-mcp-server
cd my-first-mcp-server
uv init
```

This creates a new folder with a `pyproject.toml` file inside. That file keeps track of your project's settings and the packages it depends on.

## Step 4: Install the MCP Library

We need the `fastmcp` library, which makes building MCP servers easy:

```bash
uv add "fastmcp[cli]"
```

This downloads the library and records it as a dependency in your project.

## Step 5: Create Your Server File

Create a new file called `server.py` in your project folder. You can use any text editor you like -- VS Code, Notepad, or even the terminal:

```bash
touch server.py
```

## What You Have Now

Your project folder should look like this:

```
my-first-mcp-server/
  pyproject.toml
  server.py
```

That is all the setup you need. In the next step, you will open `server.py` and write your first tool.
