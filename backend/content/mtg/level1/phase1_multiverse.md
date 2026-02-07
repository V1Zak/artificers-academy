# Phase 1: Understanding the Multiverse

*"Before you can traverse the planes, you must understand their nature."*

---

## The Architecture of Magic

In the realm of MCP (Model Context Protocol), three fundamental entities shape the fabric of reality:

### 🌟 The Host (The Planeswalker)

The **Host** is the application that wields the power of AI—think of it as a Planeswalker who channels mana through their spark. Examples include:

- **Claude Desktop** - Anthropic's official desktop application
- **Cursor** - An AI-powered code editor
- **Custom applications** - Any app that integrates AI capabilities

The Host is where the magic happens. It's the environment that brings together all the pieces.

### 🧙 The Client (The Mage's Will)

The **Client** is the protocol connector within the Host—the conduit through which the Planeswalker's will flows. It:

- Maintains connections to one or more Servers
- Handles the communication protocol
- Routes requests and responses between the AI and your tools

Think of it as the spark that allows a Planeswalker to tap into different planes of existence.

### 📚 The Server (The Deck)

The **Server** is where **you** come in. It's your deck of spells—a collection of:

- **Tools (Sorceries)** - Functions the AI can invoke
- **Resources (Artifacts)** - Data the AI can read
- **Prompts (Enchantments)** - Reusable prompt templates

When you build an MCP server, you're crafting a deck that gives the AI new capabilities.

---

## How They Connect

```
┌─────────────────────────────────────────────────────┐
│                    HOST                              │
│              (Claude Desktop)                        │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │                 CLIENT                       │    │
│  │         (Protocol Connector)                 │    │
│  │                                              │    │
│  │    ┌──────────┐  ┌──────────┐  ┌─────────┐  │    │
│  │    │ Server 1 │  │ Server 2 │  │Server 3 │  │    │
│  │    │(Your MTG │  │(Files)   │  │(Weather)│  │    │
│  │    │ Oracle)  │  │          │  │         │  │    │
│  │    └──────────┘  └──────────┘  └─────────┘  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

When you ask Claude "What does Black Lotus do?", the flow is:

1. **You** type the question in **Claude Desktop** (Host)
2. The **Client** recognizes Claude might need your MTG Oracle tool
3. Claude decides to call your `search_card` tool
4. Your **Server** receives the request, queries Scryfall, and returns the data
5. Claude crafts a response using the card information

---

## The Protocol: JSON-RPC 2.0

MCP speaks through **JSON-RPC 2.0**—a simple, standardized way to make remote procedure calls. Don't worry about the details; the `fastmcp` library handles this for you.

What matters is understanding that your server:
- **Listens** for incoming tool calls
- **Executes** the requested function
- **Returns** the result in a format Claude can understand

---

## Why This Matters

Before MCP, giving an AI new capabilities meant:
- Building custom integrations for each AI provider
- Managing complex authentication and routing
- Rewriting the same functionality over and over

With MCP, you write your server **once**, and it works with any MCP-compatible host. It's like having a deck that works across all formats—Standard, Modern, Legacy, and beyond.

---

## Key Concepts to Remember

| Concept | MTG Metaphor | Description |
|---------|--------------|-------------|
| Host | Planeswalker | The application running the AI |
| Client | Mana Bond | Protocol connector within the host |
| Server | Deck | Your collection of tools and resources |
| Tool | Sorcery | A function the AI can invoke |
| Resource | Artifact | Data the AI can access |
| Prompt | Enchantment | Reusable prompt templates |

---

## What's Next?

Now that you understand the multiverse's structure, it's time to prepare your mana base. In the next phase, you'll set up your development environment and install the tools needed to craft your first MCP server.

*"The foundation of any great spell is a stable mana base."*

---

**Phase Complete!** ✨

You now understand the fundamental architecture of MCP. Proceed to Phase 2 to begin your practical journey.
