# Phase 1: The Awakening

*"Beyond a single spark lies the power of the swarm—entities that transcend the limitations of solitary existence."*

---

## The Rise of the Eldrazi

You've mastered the fundamentals of MCP: crafting tools, exposing resources, integrating APIs, and deploying to production. But there exists a higher plane of capability—one where your MCP servers don't just provide static tools, but **summon autonomous agents** to perform complex, multi-step tasks.

Welcome to **The Nexus**, where you'll learn to harness the power of **Claude Code agents** and orchestrate multi-agent systems that work in concert like an Eldrazi swarm.

---

## What Are Agents?

In the context of Claude Code and MCP, an **agent** is an autonomous AI entity that can:

- **Execute tools** from your MCP servers
- **Read and write files** on your filesystem
- **Run bash commands** for system operations
- **Make decisions** about which tools to use and when
- **Spawn sub-agents** for specialized tasks
- **Maintain context** across multiple steps

Think of agents as **Eldrazi Spawns**—subsidiary entities that can act independently to achieve complex goals, then return their findings to the summoner.

---

## Agents vs Traditional MCP Tools

Understanding when to use agents versus traditional tools is crucial:

| Aspect | Traditional MCP Tool | Claude Code Agent |
|--------|---------------------|------------------|
| **Autonomy** | Single function call, returns immediately | Multi-step autonomous execution |
| **Capabilities** | Only what you code | Full access to filesystem, bash, tools |
| **Decision Making** | None—caller decides when to invoke | Agent decides which tools to use |
| **Duration** | Milliseconds to seconds | Seconds to minutes |
| **Use Case** | Fetch data, execute specific operation | Complex workflows, analysis, code generation |
| **MTG Metaphor** | Instant/Sorcery (single spell) | Eldrazi Spawn (autonomous entity) |

**Example:**
- **Tool:** `get_weather(city: str)` - Returns weather data immediately
- **Agent:** "Analyze the codebase, identify performance bottlenecks, generate optimization report with specific recommendations" - Multi-step research and synthesis

---

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      YOU (The Summoner)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MCP Server / Script                      │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────┐     │   │
│  │  │         Invoke Agent (Main Titan)            │     │   │
│  │  │                                              │     │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │     │   │
│  │  │  │ Read     │  │ Execute  │  │ Call     │  │     │   │
│  │  │  │ Files    │  │ Bash     │  │ Tools    │  │     │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  │     │   │
│  │  │                                              │     │   │
│  │  │  ┌───────────────────────────────────────┐  │     │   │
│  │  │  │    Spawn Sub-Agent (Processor)        │  │     │   │
│  │  │  │    (Specialized task delegation)      │  │     │   │
│  │  │  └───────────────────────────────────────┘  │     │   │
│  │  └─────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

When you invoke an agent, it has access to:
1. **File operations** (Read, Write, Edit, Glob, Grep)
2. **Bash commands** (git, npm, testing frameworks)
3. **MCP tools** (via tool search if configured)
4. **Sub-agents** (Task tool for delegation)

This is the **Planar Bridge** expanded—agents operate at a higher level of abstraction than individual tools.

---

## The Agent SDK: Programmatic Control

Beyond invoking agents from MCP tools, the **Agent SDK** allows you to:

- **Create agents programmatically** from Python/Node.js scripts
- **Configure agent behavior** (model selection, temperature, max turns)
- **Stream responses** in real-time
- **Execute multiple agents in parallel**
- **Aggregate and process results**

Think of the SDK as the **Planar Bridge**—direct, programmatic control over agent summoning and coordination.

---

## Real-World Use Cases

### Code Review Agent
**Scenario:** Your MCP server has a `review_code(file_path, focus)` tool.

When called, instead of static linting:
1. Agent reads the file and related modules
2. Analyzes patterns, identifies issues
3. Suggests improvements with specific examples
4. Returns comprehensive review

### Documentation Generator
**Scenario:** Multi-file documentation creation.

A script using Agent SDK:
1. Spawns analyzer agent for each file (parallel)
2. Aggregates code structure insights
3. Spawns writer agent to generate docs
4. Spawns reviewer agent to check accuracy
5. Returns polished documentation

### DevOps Assistant
**Scenario:** Deployment with safety checks.

An MCP tool that:
1. Invokes agent to review code changes
2. Agent runs tests and validates config
3. Agent analyzes deployment impact
4. Returns go/no-go recommendation
5. If approved, executes deployment

---

## When to Use Agents

**Use agents when:**
- Task requires multi-step reasoning
- You need autonomous decision-making
- Context spans multiple files/operations
- You want the AI to "figure out" the approach
- Task involves research + synthesis

**Use traditional tools when:**
- Single, well-defined operation
- Performance is critical (sub-second response)
- You need deterministic behavior
- The task is a simple data fetch/transform

---

## Agent Capabilities & Limitations

### Capabilities ✨
- Access to full Claude Code toolset (Read, Write, Bash, etc.)
- Multi-turn reasoning and planning
- Can spawn specialized sub-agents
- Context-aware across file operations
- Error recovery and self-correction

### Limitations ⚠️
- **Cost:** Agents consume more tokens (longer conversations)
- **Latency:** Multi-turn execution takes longer
- **Complexity:** Harder to debug than simple tools
- **Non-deterministic:** Same prompt may yield different approaches
- **Safety:** Agents can execute bash commands (requires trust)

---

## The Eldrazi Metaphor

In Magic: The Gathering lore, **Eldrazi** are ancient, powerful entities that exist beyond normal planes. They spawn lesser creatures (Scions, Drones) to carry out tasks. Similarly:

- **Main Agent** = Eldrazi Titan (Ulamog, Kozilek, Emrakul)
- **Sub-Agents** = Eldrazi Spawns/Scions (specialized entities)
- **Orchestrator** = The Summoner directing the swarm
- **Colorless Mana** = The abstract, multi-agent "resources" that transcend single-color (single-capability) limitations

Your goal in this level is to become the **Summoner of the Swarm**—one who can coordinate agents to achieve feats no single tool could accomplish.

---

## Key Concepts to Remember

| Concept | MTG Metaphor | Description |
|---------|--------------|-------------|
| Agent | Eldrazi Spawn/Scion | Autonomous AI entity with multi-step capabilities |
| Agent SDK | Planar Bridge | Programmatic control of agent creation and execution |
| Sub-Agent | Eldrazi Processor | Specialized agent spawned by main agent |
| Multi-Agent System | Eldrazi Swarm | Multiple coordinated agents working together |
| Orchestrator | The Summoner | Your code coordinating agent execution |
| Agent Context | Colorless Mana | The abstract resources agents draw upon |

---

## What's Next?

Now that you understand what agents are and when to use them, it's time to summon your first spawn. In the next phase, you'll build an MCP server with an agent-invocation tool that performs autonomous code review.

*"A single titan is formidable; a coordinated swarm is unstoppable."*

---

**Phase Complete!** ✨

You now understand agent architecture and the power of autonomous AI entities. Proceed to Phase 2 to summon your first agent.
