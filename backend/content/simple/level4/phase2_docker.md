# Packaging with Docker

Docker packages your server and everything it needs into a single container. Let's set it up.

## Step 1: Install Docker

Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/) and install it. After installation, verify it works:

```bash
docker --version
```

You should see something like `Docker version 24.x.x`.

## Step 2: Create a Dockerfile

In your project folder (we will use the API server from Level 3), create a file called `Dockerfile` (no extension):

```dockerfile
FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Set up working directory
WORKDIR /app

# Copy project files
COPY pyproject.toml .
COPY server.py .

# Install dependencies
RUN uv sync

# Set the default command to run the server
CMD ["uv", "run", "server.py"]
```

Let's understand each line:

- **`FROM python:3.12-slim`** -- Start with a small Linux system that has Python installed
- **`COPY --from=... /uv`** -- Install the `uv` package manager
- **`WORKDIR /app`** -- Create and switch to a folder called `/app` inside the container
- **`COPY pyproject.toml .`** and **`COPY server.py .`** -- Copy your project files into the container
- **`RUN uv sync`** -- Install your Python dependencies
- **`CMD [...]`** -- Tell Docker what command to run when the container starts

## Step 3: Create a .dockerignore File

Create a `.dockerignore` file to keep unnecessary files out of the container:

```
.env
__pycache__
.git
*.pyc
documents/
```

Notice we exclude `.env` -- API keys should be set as environment variables on the cloud platform, not baked into the container.

## Step 4: Build and Test Locally

Build your Docker container:

```bash
docker build -t my-mcp-server .
```

The `-t my-mcp-server` part gives the container a name. The `.` tells Docker to look for the Dockerfile in the current folder.

Test it by running:

```bash
docker run --env-file .env -p 8000:8000 my-mcp-server
```

This starts your container and passes your local `.env` file as environment variables. The `-p 8000:8000` part will be useful in the next step when we switch to SSE.

## What You Have Now

Your server is packaged into a Docker container that includes everything it needs to run. This container can be shipped to any cloud platform. In the next step, we will modify the server to accept connections over the internet.
