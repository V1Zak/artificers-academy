# Agent Invocation Tools

## Overview

MCP tools can leverage Claude Code agents to handle complex, multi-step tasks that require autonomous decision-making. This pattern allows tools to delegate work to agents that can use their own toolsets (Read, Grep, Bash, etc.) to accomplish sophisticated objectives.

## Project Setup

Initialize a new MCP server for code review:

```bash
mkdir code-reviewer-server
cd code-reviewer-server
uv init
uv add "fastmcp[cli]"
```

## Building an Agent Invocation Tool

Create `server.py`:

```python
from fastmcp import FastMCP
import os
from pathlib import Path

mcp = FastMCP("Code Reviewer")

@mcp.tool()
async def review_code(file_path: str, focus: str = "general") -> str:
    """Perform autonomous code review using an AI agent.

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
    # Conceptual agent invocation (not yet standardized):
    # result = await invoke_agent(prompt=agent_prompt, timeout=120)

    return f"""
# Code Review Report

**File:** {file_path}
**Focus:** {focus}
**Reviewer:** AI Agent (Code Analysis)

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

if __name__ == "__main__":
    mcp.run()
```

## Key Implementation Patterns

### 1. Detailed Docstrings

The docstring is critical for Claude to understand when and how to use the tool:

```python
"""Perform autonomous code review using an AI agent.

This tool reads a code file and provides comprehensive review feedback...
"""
```

Be explicit about:
- What the tool does
- What arguments it accepts and their valid values
- What it returns
- Example usage scenarios

### 2. Input Validation

Always validate inputs before processing:

```python
if not path.exists():
    return f"Error: File not found at {file_path}"

if not path.is_file():
    return f"Error: {file_path} is not a file"
```

Defensive programming prevents runtime errors and provides clear feedback.

### 3. Structured Prompts

Use focus-based prompts to guide agent behavior:

```python
focus_prompts = {
    "security": "Focus on security vulnerabilities...",
    "performance": "Analyze performance bottlenecks..."
}
```

Well-structured prompts produce more targeted and useful results.

### 4. Structured Output

Return well-formatted output that's easy to parse:

```python
return f"""
# Code Review Report

**File:** {file_path}
**Focus:** {focus}
...
"""
```

Markdown formatting with clear sections improves readability.

## Testing with Inspector

Run the server:

```bash
uv run server.py
```

In another terminal:

```bash
npx @modelcontextprotocol/inspector uv run server.py
```

Test the `review_code` tool:
1. Select the tool from the list
2. Provide a file path (e.g., `server.py`)
3. Choose a focus (e.g., `security`)
4. Observe the structured response

## Error Handling

When working with agents, handle common failure scenarios:

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

## When to Use Agent Invocation

### Good Use Cases
- Multi-file analysis needed
- Complex reasoning required
- Autonomous decision-making valuable
- User expects comprehensive output

### Avoid Agent Invocation When
- Simple data transformation
- Single-file operation
- Performance critical
- Deterministic output required

## Validation Requirements

Your implementation must:
1. Define an MCP tool with agent-related functionality
2. Include comprehensive docstring
3. Validate file input (exists, is file)
4. Handle errors gracefully
5. Return structured output

Note: Full agent invocation validation will be refined as the Agent SDK stabilizes.
