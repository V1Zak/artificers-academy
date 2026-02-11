# Phase 2: Summoning the First Spawn

*"The first invocation is always the most profound—when theory becomes reality."*

---

## The Challenge

You'll build a **Code Reviewer MCP server** that provides a tool to invoke Claude Code agents for autonomous code review. This demonstrates how MCP servers can leverage agent capabilities for complex, multi-step tasks.

---

## Project Setup

Create a new directory for your agent-enabled server:

```bash
mkdir code-reviewer-server
cd code-reviewer-server
uv init
```

Install dependencies:

```bash
uv add "fastmcp[cli]"
```

---

## Understanding Agent Invocation

When your MCP tool wants to invoke a Claude Code agent, it uses the **Task** tool available within the agent execution environment. However, since we're building an MCP server (not running inside Claude Code), we'll demonstrate the pattern conceptually.

**Note:** As of early 2026, agent invocation from MCP servers is an emerging pattern. This tutorial demonstrates the architectural approach and best practices.

---

## Building the Code Reviewer Tool

Create `server.py`:

```python
from fastmcp import FastMCP
import os
from pathlib import Path

# Initialize the MCP server
mcp = FastMCP("Code Reviewer")

@mcp.tool()
async def review_code(file_path: str, focus: str = "general") -> str:
    """
    Perform autonomous code review using an AI agent.

    This tool reads a code file and provides comprehensive review feedback,
    identifying potential issues, suggesting improvements, and analyzing
    code quality across multiple dimensions.

    Args:
        file_path: Path to the code file to review (relative or absolute)
        focus: Review focus area - options: "general", "security",
               "performance", "maintainability", "testing"

    Returns:
        Comprehensive code review report with specific recommendations

    Examples:
        - review_code("src/auth.py", "security")
        - review_code("utils/cache.py", "performance")
    """
    # Validate file exists
    path = Path(file_path)
    if not path.exists():
        return f"Error: File not found at {file_path}"

    if not path.is_file():
        return f"Error: {file_path} is not a file"

    # Read the file content
    try:
        with open(path, 'r', encoding='utf-8') as f:
            code_content = f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

    # Build the review prompt based on focus area
    focus_prompts = {
        "general": "Provide a comprehensive code review covering style, logic, and best practices.",
        "security": "Focus on security vulnerabilities, input validation, and potential exploits.",
        "performance": "Analyze performance bottlenecks, algorithmic complexity, and optimization opportunities.",
        "maintainability": "Evaluate code readability, modularity, documentation, and long-term maintenance concerns.",
        "testing": "Assess testability, identify missing test coverage, and suggest test cases."
    }

    review_focus = focus_prompts.get(focus, focus_prompts["general"])

    # Construct agent prompt
    agent_prompt = f"""
You are a senior code reviewer. Analyze the following code file and provide a detailed review.

**File:** {file_path}
**Focus:** {focus}
**Instructions:** {review_focus}

**Code:**
```
{code_content}
```

**Review Structure:**
1. **Summary:** Brief overview of the code's purpose and quality
2. **Strengths:** What the code does well
3. **Issues:** Specific problems identified (with line references if possible)
4. **Recommendations:** Concrete suggestions for improvement
5. **Priority:** High/Medium/Low priority items

Be specific, actionable, and constructive.
"""

    # In a real implementation, this would invoke a Claude Code agent
    # For demonstration, we'll return a structured response
    #
    # Conceptual agent invocation (not yet standardized):
    # result = await invoke_agent(prompt=agent_prompt, timeout=120)

    # Simulated response for tutorial purposes
    return f"""
# Code Review Report

**File:** {file_path}
**Focus:** {focus}
**Reviewer:** AI Agent (Code Analysis Spawn)

---

## Summary
Analyzed {len(code_content)} characters of code. Review complete.

## Agent Analysis
[In production, this would contain the agent's detailed findings]

The agent would have:
1. Read the file: {path.name}
2. Analyzed code patterns and structure
3. Identified issues specific to {focus} focus
4. Generated actionable recommendations

## Next Steps
To enable full agent invocation:
- Integrate with Claude Code Agent SDK
- Configure agent with appropriate tools (Read, Grep, etc.)
- Handle streaming responses for real-time feedback
- Implement timeout and error recovery

---

**Review initiated successfully.** Full agent integration requires Agent SDK configuration.
"""

# Run the server
if __name__ == "__main__":
    mcp.run()
```

---

## Key Implementation Patterns

### 1. Detailed Docstrings (Oracle Text)
```python
"""
Perform autonomous code review using an AI agent.

This tool reads a code file and provides comprehensive review feedback...
"""
```

The docstring is crucial—it's what Claude sees when deciding whether to use this tool. Be explicit about:
- What the tool does
- What arguments it accepts
- What it returns
- Example usage

### 2. Input Validation
```python
if not path.exists():
    return f"Error: File not found at {file_path}"
```

Always validate inputs before processing. Agents are smart, but your tools should be defensive.

### 3. Focus-Based Prompts
```python
focus_prompts = {
    "security": "Focus on security vulnerabilities...",
    "performance": "Analyze performance bottlenecks..."
}
```

Structured prompts help agents provide targeted, relevant feedback.

### 4. Structured Output
```python
return f"""
# Code Review Report

**File:** {file_path}
...
"""
```

Return well-formatted output that Claude can parse and present to users.

---

## Testing with the Inspector

Run the server:

```bash
uv run server.py
```

In another terminal, launch the Inspector:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

Test the `review_code` tool:
1. Select the tool from the list
2. Provide a file path (e.g., `server.py`)
3. Choose a focus (e.g., `security`)
4. Observe the structured response

---

## Agent Invocation Patterns (Conceptual)

When agent invocation becomes standardized, the pattern will likely resemble:

```python
# Future agent invocation pattern
from claude_code_agent import invoke_agent

result = await invoke_agent(
    prompt=agent_prompt,
    model="claude-sonnet-4.5",
    max_turns=10,
    timeout=120,
    tools=["Read", "Grep", "Bash"]  # Available tools for agent
)

return result.content
```

The agent would:
1. Receive the prompt
2. Decide which tools to use (Read the file, Grep for patterns, etc.)
3. Execute multiple turns of analysis
4. Return comprehensive findings

---

## Error Handling for Agents

When working with agents, handle these scenarios:

```python
try:
    result = await invoke_agent(prompt=agent_prompt, timeout=120)
    return result.content
except TimeoutError:
    return "Agent timeout: Review took too long. Try a smaller file."
except AgentError as e:
    return f"Agent execution failed: {str(e)}"
except Exception as e:
    return f"Unexpected error: {str(e)}"
```

---

## The Eldrazi Spawn Pattern

Think of agent-invocation tools as **summoning spells**:

1. **The Summoner:** Your MCP tool (the function with `@mcp.tool()`)
2. **The Spawn:** The agent that gets invoked
3. **The Task:** The prompt you provide
4. **The Return:** The agent's findings

Your tool orchestrates the summoning, but the agent does the autonomous work.

---

## Real-World Considerations

### When to Use Agent Invocation
✅ Multi-file analysis needed
✅ Complex reasoning required
✅ Autonomous decision-making valuable
✅ User expects comprehensive output

### When to Use Direct Processing
✅ Simple data transformation
✅ Single-file operation
✅ Performance critical
✅ Deterministic output required

---

## Validation Checkpoint

For this phase's validation, your code must:
1. ✅ Define an MCP tool with agent-related functionality
2. ✅ Include comprehensive docstring
3. ✅ Validate file input (exists, is file)
4. ✅ Handle errors gracefully
5. ✅ Return structured output

**Note:** Full agent invocation validation will be refined as the Agent SDK stabilizes.

---

## What's Next?

You've built an MCP tool designed for agent invocation. In the next phase, you'll learn to use the **Agent SDK** directly from Python scripts for programmatic agent control and parallel execution.

*"A single spawn proves the concept; a swarm demonstrates mastery."*

---

**Phase Complete!** ✨

You've summoned your first agent-capable MCP tool. Proceed to Phase 3 to master the Agent SDK.
