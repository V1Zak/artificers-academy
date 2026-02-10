# Agent SDK Integration

## Overview

The Agent SDK provides programmatic access to Claude Code's agent capabilities. Unlike MCP tools that are invoked by Claude, the SDK allows your Python scripts to directly create, configure, and control agents.

This enables:
- Batch processing across multiple files
- Pipeline automation with chained agent outputs
- Custom workflows outside of MCP
- CI/CD integration for automated code analysis

## Installation

As of early 2026, the Agent SDK is in active development. Check official documentation for the latest installation instructions.

Conceptual installation:

```bash
mkdir test-generator
cd test-generator
uv init
uv add claude-agent-sdk anthropic
```

Configure authentication:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

Or use a `.env` file:

```bash
# .env
ANTHROPIC_API_KEY=your-api-key-here
```

## Project: Test Generator

Build a script that uses the Agent SDK to generate unit tests for Python files. The agent will analyze source code, identify testable functions, and generate pytest test cases.

Create `generate_tests.py`:

```python
#!/usr/bin/env python3
"""
Test Generator using Claude Code Agent SDK

Analyzes Python source files and generates comprehensive unit tests
using autonomous AI agents.
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
    """Generate unit tests for a single Python file using an agent.

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
        model="claude-sonnet-4.5",
        max_turns=10,
        timeout=90,
        temperature=0.3,  # Lower temperature for consistent code
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
    """Generate tests for multiple files in parallel.

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

Configuration options:
- `model`: `claude-opus-4.6` (most capable), `claude-sonnet-4.5` (balanced), `claude-haiku-4.5` (fastest)
- `max_turns`: Number of reasoning cycles the agent can perform
- `timeout`: Maximum execution time in seconds
- `temperature`: 0.0 (deterministic) to 1.0 (creative)

### 2. Async Agent Execution

```python
agent = Agent(config=config)
result = await agent.run(prompt=prompt)
```

Agents are asynchronous by nature. Always use `async/await` for agent invocations.

### 3. Parallel Execution

```python
tasks = [generate_tests_for_file(fp) for fp in file_paths]
results = await asyncio.gather(*tasks, return_exceptions=True)
```

`asyncio.gather()` runs multiple agents concurrently, dramatically reducing total execution time for batch operations.

### 4. Error Handling

```python
try:
    result = await agent.run(prompt=prompt)
except TimeoutError:
    # Handle agent timeout
except Exception as e:
    # Handle other errors
```

Always wrap agent invocations in try/except blocks for robustness.

## Running the Test Generator

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

Run the generator:

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

Inspect generated tests:

```bash
cat tests/test_calculator.py
```

The agent will have generated comprehensive tests with edge cases, error scenarios, and proper pytest structure.

## Streaming Responses (Advanced)

For long-running agents, stream responses in real-time:

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

## Validation Requirements

Your implementation must:
1. Import and configure the Agent SDK
2. Create at least one agent with custom configuration
3. Execute agent with a prompt
4. Handle async execution (use `async/await`)
5. Demonstrate error handling (try/except)
6. (Bonus) Run multiple agents in parallel with `asyncio.gather()`

## Best Practices

### Do
- Configure timeouts appropriate to task complexity
- Use lower temperatures (0.2-0.4) for code generation
- Run agents in parallel when tasks are independent
- Handle timeouts and exceptions gracefully
- Log agent invocations for debugging

### Don't
- Run agents synchronously when parallel is possible
- Use high max_turns (>20) without good reason (cost)
- Ignore error handling
- Hardcode API keys (use environment variables)
- Forget to set timeouts (agents can run indefinitely)
