# Phase 3: The Scrying Network

*"Direct control over the spawns—this is the Planar Bridge manifested."*

---

## The Power of Programmatic Control

In Phase 2, you built an MCP tool designed for agent invocation. Now, you'll learn to control agents **directly from Python scripts** using the **Agent SDK**. This opens up powerful possibilities:

- **Batch processing:** Run agents across multiple files in parallel
- **Pipeline automation:** Chain agent outputs as inputs
- **Custom workflows:** Build specialized tools outside of MCP
- **CI/CD integration:** Agents in your build/deployment pipelines

---

## What is the Agent SDK?

The **Agent SDK** provides programmatic access to Claude Code's agent capabilities. It allows you to:

- Create and configure agents from code
- Execute agents with custom prompts
- Stream responses in real-time
- Run multiple agents concurrently
- Process and aggregate results

Think of it as the **Planar Bridge**—direct, code-level control over agent summoning and coordination.

---

## Installation & Setup

**Note:** As of early 2026, the Agent SDK is in active development. Check the official documentation for the latest installation instructions.

Conceptual installation:

```bash
# Create a new project
mkdir test-generator
cd test-generator
uv init

# Install the Agent SDK (package name may vary)
uv add claude-agent-sdk anthropic
```

Authentication setup:

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"
```

Or use a `.env` file:

```bash
# .env
ANTHROPIC_API_KEY=your-api-key-here
```

---

## Project: Test Generator

You'll build a Python script that uses the Agent SDK to generate unit tests for Python files. The agent will:

1. Analyze the source code
2. Identify testable functions
3. Generate pytest test cases
4. Return complete test file content

---

## Building the Test Generator

Create `generate_tests.py`:

```python
#!/usr/bin/env python3
"""
Test Generator using Claude Code Agent SDK

This script analyzes Python source files and generates comprehensive
unit tests using autonomous AI agents.
"""

import asyncio
import os
from pathlib import Path
from typing import List, Dict
import sys

# Conceptual Agent SDK import (API subject to change)
try:
    from claude_agent_sdk import Agent, AgentConfig
except ImportError:
    print("Agent SDK not yet available. This is a conceptual implementation.")
    print("Install with: uv add claude-agent-sdk")
    sys.exit(1)


async def generate_tests_for_file(file_path: Path) -> Dict[str, str]:
    """
    Generate unit tests for a single Python file using an agent.

    Args:
        file_path: Path to the Python source file

    Returns:
        Dictionary with 'file_path', 'tests', and 'status'
    """
    # Read the source file
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            source_code = f.read()
    except Exception as e:
        return {
            "file_path": str(file_path),
            "tests": None,
            "status": f"Error reading file: {e}"
        }

    # Construct the agent prompt
    prompt = f"""
You are a testing expert. Analyze the following Python code and generate comprehensive pytest unit tests.

**File:** {file_path.name}

**Source Code:**
```python
{source_code}
```

**Requirements:**
1. Generate pytest test cases for all testable functions
2. Include edge cases and error scenarios
3. Use appropriate fixtures if needed
4. Add docstrings to test functions
5. Aim for high code coverage

**Output Format:**
Return ONLY the test file content (complete Python code), no explanations.
Start with necessary imports, then test functions.
"""

    # Configure the agent
    config = AgentConfig(
        model="claude-sonnet-4.5",  # Choose appropriate model
        max_turns=10,  # Allow up to 10 reasoning turns
        timeout=90,  # 90 second timeout
        temperature=0.3,  # Lower temperature for more consistent code
    )

    # Create and invoke the agent
    try:
        agent = Agent(config=config)
        result = await agent.run(prompt=prompt)

        return {
            "file_path": str(file_path),
            "tests": result.content,
            "status": "success"
        }

    except TimeoutError:
        return {
            "file_path": str(file_path),
            "tests": None,
            "status": "Agent timeout"
        }
    except Exception as e:
        return {
            "file_path": str(file_path),
            "tests": None,
            "status": f"Agent error: {e}"
        }


async def generate_tests_parallel(file_paths: List[Path]) -> List[Dict[str, str]]:
    """
    Generate tests for multiple files in parallel.

    Args:
        file_paths: List of Python source files

    Returns:
        List of results (one per file)
    """
    # Create tasks for parallel execution
    tasks = [generate_tests_for_file(fp) for fp in file_paths]

    # Run all agents concurrently
    results = await asyncio.gather(*tasks, return_exceptions=True)

    return results


async def main():
    """Main entry point."""
    # Example: Generate tests for files in src/ directory
    src_dir = Path("src")

    if not src_dir.exists():
        print(f"Error: {src_dir} directory not found")
        print("Create a 'src/' directory with Python files to test.")
        return

    # Find all Python files
    python_files = list(src_dir.glob("**/*.py"))

    if not python_files:
        print(f"No Python files found in {src_dir}")
        return

    print(f"Found {len(python_files)} Python file(s)")
    print("Generating tests using AI agents...\n")

    # Generate tests in parallel
    results = await generate_tests_parallel(python_files)

    # Process results
    output_dir = Path("tests")
    output_dir.mkdir(exist_ok=True)

    for result in results:
        if isinstance(result, Exception):
            print(f"Exception: {result}")
            continue

        file_path = Path(result["file_path"])
        status = result["status"]

        if status == "success" and result["tests"]:
            # Write test file
            test_file_name = f"test_{file_path.stem}.py"
            test_file_path = output_dir / test_file_name

            with open(test_file_path, 'w', encoding='utf-8') as f:
                f.write(result["tests"])

            print(f"✅ {file_path.name} -> {test_file_name}")
        else:
            print(f"❌ {file_path.name}: {status}")

    print(f"\n✨ Test generation complete! Check {output_dir}/ for results.")


if __name__ == "__main__":
    asyncio.run(main())
```

---

## Key SDK Patterns

### 1. Agent Configuration

```python
config = AgentConfig(
    model="claude-sonnet-4.5",  # Model selection
    max_turns=10,               # Reasoning depth
    timeout=90,                 # Time limit
    temperature=0.3,            # Consistency vs creativity
)
```

**Configuration options:**
- `model`: `claude-opus-4.6` (most capable), `claude-sonnet-4.5` (balanced), `claude-haiku-4.5` (fastest)
- `max_turns`: How many reasoning cycles the agent can perform
- `timeout`: Maximum execution time
- `temperature`: 0.0 (deterministic) to 1.0 (creative)

### 2. Async Agent Execution

```python
agent = Agent(config=config)
result = await agent.run(prompt=prompt)
```

Agents are **async** by nature—they may take seconds or minutes. Always use `async/await`.

### 3. Parallel Execution

```python
tasks = [generate_tests_for_file(fp) for fp in file_paths]
results = await asyncio.gather(*tasks, return_exceptions=True)
```

`asyncio.gather()` runs multiple agents **concurrently**, dramatically speeding up batch processing.

### 4. Error Handling

```python
try:
    result = await agent.run(prompt=prompt)
except TimeoutError:
    # Handle agent timeout
except Exception as e:
    # Handle other errors
```

Always wrap agent invocations in try/except for robustness.

---

## Running the Test Generator

### Setup Test Files

Create a sample source file:

```bash
mkdir src
cat > src/calculator.py << 'EOF'
def add(a, b):
    """Add two numbers."""
    return a + b

def divide(a, b):
    """Divide a by b."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def factorial(n):
    """Calculate factorial of n."""
    if n < 0:
        raise ValueError("Factorial undefined for negative numbers")
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
EOF
```

### Run the Generator

```bash
chmod +x generate_tests.py
uv run generate_tests.py
```

Expected output:

```
Found 1 Python file(s)
Generating tests using AI agents...

✅ calculator.py -> test_calculator.py

✨ Test generation complete! Check tests/ for results.
```

### Inspect Generated Tests

```bash
cat tests/test_calculator.py
```

The agent will have generated comprehensive tests with edge cases, error scenarios, and proper structure.

---

## Streaming Responses (Advanced)

For long-running agents, you can stream responses in real-time:

```python
async def generate_with_streaming(file_path: Path):
    """Generate tests with real-time streaming feedback."""
    agent = Agent(config=config)

    # Stream the agent's output
    async for chunk in agent.stream(prompt=prompt):
        print(chunk.content, end="", flush=True)

    print()  # Newline after streaming complete
```

Streaming provides:
- Real-time progress visibility
- Early output for long tasks
- Better user experience

---

## The Scrying Network Metaphor

**Scrying** in Magic: The Gathering means looking at top cards of your library and making decisions. Similarly, the Agent SDK gives you "scrying" powers:

1. **Parallel Scrying:** Run multiple agents to "scry" different files simultaneously
2. **Controlled Outcomes:** Configure agents for desired behavior (temperature, max turns)
3. **Network Effect:** Aggregate insights from multiple agents

You're building a **network of observation and analysis**—hence "Scrying Network."

---

## Validation Checkpoint

For this phase's validation, your code must:
1. ✅ Import and configure the Agent SDK
2. ✅ Create at least one agent with custom configuration
3. ✅ Execute agent with a prompt
4. ✅ Handle async execution (use `async/await`)
5. ✅ Demonstrate error handling (try/except)
6. ✅ (Bonus) Run multiple agents in parallel with `asyncio.gather()`

---

## Best Practices

### ✅ DO
- Configure timeouts appropriate to task complexity
- Use lower temperatures (0.2-0.4) for code generation
- Run agents in parallel when tasks are independent
- Handle timeouts and exceptions gracefully
- Log agent invocations for debugging

### ❌ DON'T
- Run agents synchronously when parallel is possible
- Use high max_turns (>20) without good reason (cost!)
- Ignore error handling
- Hardcode API keys (use environment variables)
- Forget to set timeouts (agents can run indefinitely)

---

## What's Next?

You've mastered programmatic agent control with the SDK. In the next phase, you'll orchestrate **multiple specialized agents** working together in a coordinated pipeline—the true power of the swarm.

*"One agent is a tool; many agents coordinated are an unstoppable force."*

---

**Phase Complete!** ✨

You've harnessed the Agent SDK for programmatic control. Proceed to Phase 4 to build multi-agent orchestration systems.
