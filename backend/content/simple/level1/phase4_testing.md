# Testing Your Server

You have written a server with two tools. Before connecting it to an AI, let's make sure everything works using a testing tool called the **MCP Inspector**.

## What is the Inspector?

The Inspector is a web-based tool that lets you see your server the way an AI would see it. You can browse the available tools, read their descriptions, and call them with test inputs. It is the fastest way to check that your server is working correctly.

## Running the Inspector

In your terminal, make sure you are in your project folder, then run:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

This command does two things: it starts your server, and it starts the Inspector. After a moment, you will see a message with a URL like `http://localhost:5173`. Open that URL in your web browser.

> **Note:** If you are asked to install `@modelcontextprotocol/inspector`, type `y` and press Enter.

## Exploring the Inspector

When the Inspector opens, you will see a clean interface with a few sections:

1. **Tools tab** -- Click this to see a list of your tools. You should see `greet` and `add_numbers`.

2. **Click on a tool** -- Select `greet` and you will see its description ("Say hello to someone by name") and an input field for `name`.

3. **Test it** -- Type your name into the field and click "Run". You should see the greeting message appear in the results panel.

4. **Try the other tool** -- Select `add_numbers`, enter two numbers (like `7` and `3`), and run it. You should see `10.0` in the results.

## What To Look For

- Both tools appear in the list
- Descriptions match what you wrote in your docstrings
- Input fields match your function parameters
- Results are correct

## Troubleshooting

If the Inspector does not start, check that:
- You are in the right folder (the one with `server.py`)
- You have Node.js installed (needed for `npx`). Download it from [nodejs.org](https://nodejs.org/) if needed
- Your `server.py` has no syntax errors -- run `uv run server.py` by itself first to check

Once both tools work in the Inspector, you are ready for the final step: connecting to a real AI.
