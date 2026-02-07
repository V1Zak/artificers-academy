# Connecting to an AI

Your server works, your tools are tested, and now it is time to connect everything to Claude Desktop. Once this is done, Claude will be able to use your tools in a real conversation.

## Step 1: Install Claude Desktop

If you do not have Claude Desktop yet, download it from [claude.ai/download](https://claude.ai/download) and install it. Open the app and sign in with your Anthropic account.

## Step 2: Open the Configuration File

Claude Desktop needs to know about your server. This is done through a configuration file.

**On Mac:**
Open your terminal and run:
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**On Windows:**
Open this file in a text editor:
```
%APPDATA%\Claude\claude_desktop_config.json
```

If the file does not exist yet, create it.

## Step 3: Add Your Server

Replace the contents of the file with this (update the path to match your project location):

```json
{
  "mcpServers": {
    "my-first-server": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/full/path/to/my-first-mcp-server"
    }
  }
}
```

Replace `/full/path/to/my-first-mcp-server` with the actual path to your project folder. On Mac, this might be something like `/Users/yourname/my-first-mcp-server`. On Windows, it might be `C:\\Users\\yourname\\my-first-mcp-server`.

## Step 4: Restart Claude Desktop

Close Claude Desktop completely and reopen it. When it starts, it will read the configuration file and connect to your server.

## Step 5: Try It Out

Start a new conversation in Claude Desktop and try these prompts:

- "Say hello to Alex"
- "What is 42 plus 17?"

You should see Claude use your tools to answer. Look for a small indicator showing that a tool was called.

## What Just Happened

Claude read your tool descriptions, figured out which tool to call based on the user's question, sent the request to your server, and used the result in its response. All of that happened automatically.

## Congratulations

You have built and connected your first MCP server. You now understand the full cycle: write tools, test them, and connect them to an AI. The next level will teach you how to build something more useful -- a file server.
