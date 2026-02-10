# Agent Architecture

## Claude Code Agents

Claude Code agents are autonomous AI entities that can execute multi-step tasks by orchestrating tool calls, file operations, and bash commands. Unlike traditional MCP tools which perform single, deterministic operations, agents employ reasoning to achieve complex objectives.

## Agent Capabilities

Agents have access to a comprehensive toolset:

- **File Operations**: Read, Write, Edit, Glob (pattern matching), Grep (content search)
- **Shell Execution**: Bash commands for system operations, git, testing, package management
- **Tool Search**: Discovery and invocation of available MCP tools
- **Sub-Agent Delegation**: Task tool for spawning specialized agents
- **Planning**: Multi-turn reasoning with context maintenance

## Architectural Comparison

### Traditional MCP Tool
```
User → Claude → MCP Tool → Single Operation → Result
```

**Characteristics:**
- Single function call
- Deterministic output
- Millisecond to second latency
- Explicit control flow

### Agent-Based Tool
```
User → Claude → MCP Tool → Agent Invocation →
  Agent Decision Tree (Read files, Run commands, Call tools) →
  Multi-step execution → Synthesized Result
```

**Characteristics:**
- Multi-turn autonomous execution
- Non-deterministic (reasoning-based)
- Second to minute latency
- Autonomous control flow

## When to Use Agents

Use agents when:
- Multi-file analysis required
- Task involves research and synthesis
- Approach is unclear and requires exploration
- Decision-making logic is complex

Use traditional tools when:
- Single, well-defined operation
- Performance critical (sub-second response required)
- Deterministic output required
- Simple data transformation

## Agent SDK

The Agent SDK provides programmatic access to agent capabilities outside the Claude Code CLI environment. It allows:

- Creating agents from Python/TypeScript applications
- Configuring agent behavior (model, max_turns, temperature)
- Streaming responses in real-time
- Parallel agent execution
- Custom error handling and retry logic

## Multi-Agent Systems

Multi-agent systems coordinate multiple specialized agents to solve complex problems. Common patterns:

**Sequential Pipeline**: Agents execute in order, each consuming previous output
```
Agent A (Analysis) → Agent B (Processing) → Agent C (Synthesis)
```

**Parallel Execution**: Independent agents process different inputs concurrently
```
Agent A (File 1) ⎤
Agent B (File 2) ⎥→ Aggregator → Final Result
Agent C (File 3) ⎦
```

**Hierarchical Delegation**: Main agent spawns sub-agents for subtasks
```
Main Agent → Sub-Agent 1 (Research)
          → Sub-Agent 2 (Implementation)
          → Sub-Agent 3 (Testing)
```

## Cost and Performance Considerations

**Token Usage:**
- Agents consume significantly more tokens than traditional tools
- Multi-turn reasoning multiplies costs
- Model selection impacts both cost and capability

**Latency:**
- Agent invocations add 10-60+ seconds depending on complexity
- Network latency for API calls
- Multiple agents in sequence compound latency

**Best Practices:**
- Use Haiku (fastest, cheapest) for simple agent tasks
- Reserve Sonnet/Opus for complex reasoning
- Implement timeouts to prevent runaway execution
- Cache agent results when appropriate
- Monitor token usage and costs

## Agent Configuration

Agents are configured via parameters:

| Parameter | Purpose | Range |
|-----------|---------|-------|
| `model` | Claude model to use | haiku-4.5, sonnet-4.5, opus-4.6 |
| `max_turns` | Maximum reasoning cycles | 1-50 (typical: 5-15) |
| `timeout` | Execution time limit | 30-300 seconds |
| `temperature` | Output randomness | 0.0 (deterministic) - 1.0 (creative) |

Lower temperature (0.2-0.4) recommended for code generation and structured tasks. Higher temperature (0.6-0.8) for creative content.

## Security and Safety

Agents have powerful capabilities that require consideration:

**Risks:**
- File system access (read/write)
- Arbitrary bash command execution
- External API calls
- Potential for runaway token consumption

**Mitigations:**
- Sandboxed execution environments
- Approval gates for high-risk operations
- Budget limits on token usage
- Audit logging of all agent actions
- Timeout enforcement

## What's Next

In the following phases, you'll:
1. Build an MCP tool that invokes agents
2. Use the Agent SDK for programmatic control
3. Orchestrate multi-agent systems
4. Implement production-ready agent-aware servers
