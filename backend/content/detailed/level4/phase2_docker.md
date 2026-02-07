# Docker Containerization

## Why Docker for MCP Servers?

Containerization solves the "works on my machine" problem. By packaging your MCP server, its Python runtime, and all dependencies into a Docker image, you ensure consistent behavior across development, staging, and production environments.

## Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
# Stage 1: Build dependencies
FROM python:3.12-slim AS builder

# Install uv for fast dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Set working directory
WORKDIR /app

# Copy dependency files first (layer caching optimization).
# Docker caches each layer. By copying pyproject.toml and uv.lock
# before the source code, dependency installation is cached and
# only re-runs when dependencies change.
COPY pyproject.toml uv.lock ./

# Install dependencies into the project virtual environment
RUN uv sync --frozen --no-dev

# Stage 2: Runtime image
FROM python:3.12-slim

WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /app/.venv /app/.venv

# Copy application source code
COPY server.py .

# Add the virtual environment to PATH so Python finds installed packages
ENV PATH="/app/.venv/bin:$PATH"

# Run as non-root user for security.
# Never run production containers as root.
RUN useradd --create-home appuser
USER appuser

# Expose the port for SSE transport (configured in Phase 3)
EXPOSE 8000

# Start the MCP server
CMD ["python", "server.py"]
```

## Multi-Stage Build Explained

The Dockerfile uses a two-stage build:

1. **Builder stage**: Installs `uv` and resolves dependencies. This stage includes build tools that are not needed at runtime.
2. **Runtime stage**: Copies only the virtual environment and source code. The final image is smaller because it excludes `uv` and build artifacts.

This results in an image that is typically 150-200MB instead of 500MB+.

## Layer Caching Strategy

Docker caches each `COPY`/`RUN` instruction as a layer. The key optimization is copying `pyproject.toml` and `uv.lock` before `server.py`:

```dockerfile
# These files change rarely → cached layer
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# This file changes frequently → only this layer rebuilds
COPY server.py .
```

Without this ordering, every code change would trigger a full dependency reinstall.

## The .dockerignore File

Create `.dockerignore` to exclude unnecessary files from the build context:

```
# .dockerignore
.venv/
.env
.git/
__pycache__/
*.pyc
.DS_Store
```

This reduces build context size and prevents sensitive files (`.env`) from being included in the image.

## Building the Image

```bash
docker build -t mcp-api-server .
```

## Testing Locally

Run the container to verify it starts:

```bash
# For stdio transport (current state)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  docker run -i --env-file .env mcp-api-server

# This should output the tools/list response
```

For interactive testing:

```bash
docker run -it --env-file .env mcp-api-server
```

The `--env-file .env` flag passes your API keys to the container without baking them into the image.

## Security Best Practices

1. **Non-root user**: The `USER appuser` directive ensures the process runs without root privileges.
2. **No secrets in image**: API keys are passed via environment variables at runtime, not `COPY`ed or `ENV`-set during build.
3. **Minimal base image**: `python:3.12-slim` excludes unnecessary system packages.
4. **Frozen lockfile**: `--frozen` ensures `uv` uses the exact versions from `uv.lock` without resolving.

## Next Step

The container currently uses stdio transport. In the next phase, you will modify the server to use SSE transport, which enables HTTP-based communication required for cloud deployment.
