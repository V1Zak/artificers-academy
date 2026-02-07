# Remote Connections

Right now, your server uses **stdio** -- it reads from standard input and writes to standard output. This only works when the server and client are on the same computer. To accept connections over the internet, we need to switch to **SSE** (Server-Sent Events).

## What Changes

The good news: you do not need to rewrite your tools or resources. FastMCP handles the transport layer for you. You just need to tell it to use SSE instead of stdio.

## Update Your Server

Open `server.py` and add this at the very bottom of the file:

```python
if __name__ == "__main__":
    mcp.run(transport="sse")
```

If you already have a `if __name__ == "__main__":` block, replace it with the line above.

That is the only change to your server code. FastMCP now starts an HTTP server that listens for SSE connections instead of reading from stdin.

## Set the Port

Cloud platforms assign a port number through an environment variable called `PORT`. Update your server to read it:

```python
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    mcp.run(transport="sse", port=port)
```

This reads the `PORT` environment variable if it exists, or defaults to `8000` for local testing.

## Update the Dockerfile

Update the `CMD` line in your Dockerfile:

```dockerfile
CMD ["uv", "run", "server.py"]
```

This stays the same -- the server code itself now handles starting in SSE mode.

## Test Locally

Rebuild and run:

```bash
docker build -t my-mcp-server .
docker run --env-file .env -p 8000:8000 my-mcp-server
```

You should see output indicating the server is listening on port 8000. Open your browser and go to `http://localhost:8000/sse` -- you should see the SSE stream start (it may look like a blank page or a streaming connection).

## Test with the Inspector

You can also point the Inspector at your SSE server:

```bash
npx @modelcontextprotocol/inspector --sse http://localhost:8000/sse
```

Your tools and resources should appear just like before, but now they are being accessed over HTTP instead of stdio.

## Keeping Both Options

If you want your server to work both locally (stdio) and remotely (SSE), you can check for a command-line flag:

```python
import sys

if __name__ == "__main__":
    if "--sse" in sys.argv:
        port = int(os.getenv("PORT", 8000))
        mcp.run(transport="sse", port=port)
    else:
        mcp.run()
```

This way, running `uv run server.py` uses stdio (for local use), and `uv run server.py --sse` uses SSE (for cloud deployment).

Your server is now ready for the internet. Next, we will deploy it to Railway.
