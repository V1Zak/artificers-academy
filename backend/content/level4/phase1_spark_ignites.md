# Phase 1: The Spark Ignites

*"A Planeswalker's spark allows them to travel between planes. Your deployment spark allows your creations to reach across the void."*

---

## From Local to Global

You've built powerful MCP servers that run on your machine. But what if you want:

- **Remote Access** - Use your tools from anywhere
- **Sharing** - Let others use your servers
- **Always-On** - Keep servers running without your laptop
- **Scaling** - Handle multiple users simultaneously

This is where **deployment** comes in—taking your local creations and giving them life in the cloud.

---

## MCP Transport Protocols

So far, your servers have used **stdio** transport—communication through standard input/output pipes. This works great locally but can't cross network boundaries.

### The Three Transports

| Transport | Protocol | Use Case | MTG Metaphor |
|-----------|----------|----------|--------------|
| **stdio** | Pipes | Local process communication | Kitchen Table |
| **SSE** | HTTP + Server-Sent Events | Remote over HTTP | Tournament Hall |
| **WebSocket** | WebSocket | Real-time bidirectional | Arena Championship |

### stdio (What you've been using)
```
Claude Desktop ←→ [pipe] ←→ Your MCP Server
                  (same machine)
```

### SSE (What we'll learn)
```
Claude Desktop ←→ [HTTPS] ←→ Cloud Server
                  (anywhere)
```

---

## Server-Sent Events (SSE)

SSE is a web technology that allows servers to push data to clients over HTTP:

1. Client opens HTTP connection to server
2. Server keeps connection open
3. Server sends events whenever it has data
4. Client receives events in real-time

This is perfect for MCP because:
- Works over standard HTTP (firewalls friendly)
- One-way server push (efficient for responses)
- Automatic reconnection handling
- Simple to implement

---

## The Deployment Stack

To deploy an MCP server, you'll need:

### 1. Your Server (with SSE transport)
Modified to listen on HTTP instead of stdio.

### 2. A Container (Docker)
Packages your server with all dependencies.

### 3. A Cloud Platform
Hosts and runs your container:
- **Railway** - Simple, Git-based deploys
- **Fly.io** - Global edge deployment
- **Render** - Straightforward hosting
- **Your own server** - Full control

---

## Security in the Eternities

Deploying to the cloud introduces security considerations:

### Authentication
Who can use your server? Options:
- **API Keys** - Simple bearer tokens
- **OAuth** - Full user authentication
- **IP Allowlisting** - Restrict by network

### HTTPS
Always use HTTPS in production:
- Encrypts traffic
- Prevents man-in-the-middle attacks
- Required by most clients

### Environment Secrets
- Use platform secret management
- Never commit secrets to git
- Rotate keys periodically

### Rate Limiting
- Prevent abuse
- Protect your API quotas
- Fair usage for all users

---

## What We'll Build

In this level, you'll take your Aether Conduit and:

1. **Convert to SSE transport** - Make it network-accessible
2. **Containerize with Docker** - Package for deployment
3. **Deploy to Railway** - Host in the cloud
4. **Connect Claude Desktop** - Use your remote server

The final result: a production MCP server accessible from anywhere!

---

## Prerequisites Check

Before continuing, ensure you have:

- [ ] **Docker installed** - [Get Docker](https://www.docker.com/get-started/)
- [ ] **Git configured** - For pushing to deployment platforms
- [ ] **Railway account** - [Sign up free](https://railway.app/) (or alternative platform)
- [ ] **Your Aether Conduit project** - From Level 3

### Verify Docker

```bash
docker --version
# Docker version 24.x.x or newer
```

If you don't have Docker, install it now—we'll wait.

---

## Understanding Containerization

Docker lets you package your application with its dependencies into a **container**—a lightweight, portable unit that runs anywhere.

### Why Docker for MCP?

1. **Consistency** - Same environment locally and in production
2. **Dependencies** - Python version, packages all included
3. **Isolation** - Won't conflict with other applications
4. **Portability** - Run on any cloud platform

### The Docker Hierarchy

```
Image        →    Container     →    Running Process
(blueprint)       (instance)         (your server)
```

Think of it like:
- **Image** = Deck list (the recipe)
- **Container** = A shuffled deck (ready to play)
- **Process** = The game in progress

---

## Platform Comparison

| Platform | Pros | Cons | Free Tier |
|----------|------|------|-----------|
| **Railway** | Simple, GitHub integration | Limited free tier | $5 credit/month |
| **Fly.io** | Global edge, fast | More complex CLI | Limited free |
| **Render** | Easy dashboards | Slower deploys | Free with limits |
| **Heroku** | Well-known | Expensive now | No free tier |

We'll use **Railway** for its simplicity, but the concepts apply to any platform.

---

## Key Concepts to Remember

| Concept | MTG Metaphor | Description |
|---------|--------------|-------------|
| Deployment | Planar Portal | Moving your server to the cloud |
| SSE Transport | Tournament Hall | Network-based communication |
| Docker | Spellbook | Packaged server with dependencies |
| Container | Summoned Creature | Running instance of your server |
| Cloud Platform | Distant Plane | Where your server lives |
| HTTPS | Counterspell Shield | Encrypted secure connection |

---

## The Journey Ahead

### Phase 2: Forging the Vessel
Prepare your server for production and create a Dockerfile.

### Phase 3: The Planar Portal
Convert to SSE transport and add health checks.

### Phase 4: Traversing the Eternities
Deploy to Railway and configure the platform.

### Phase 5: The Ascension
Connect Claude Desktop and celebrate your mastery!

---

## What's Next?

In Phase 2, you'll prepare your server for the cloud—adding production configurations and creating a Docker container.

*"The spark has ignited. The journey to the Blind Eternities begins."*

---

**Phase Complete!**

You understand deployment concepts and MCP transports. Proceed to Phase 2 to prepare your server for production.
