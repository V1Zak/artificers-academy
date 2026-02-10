# Controlling Agents with Code

## What is the Agent SDK?

The **Agent SDK** is a tool that lets you control AI helpers directly from your Python code. Instead of just building tools for AI to use, you can write programs that CREATE and CONTROL the AI helpers themselves!

Think of it like this:
- Before: You built tools that AI could choose to use
- Now: Your code directly tells AI helpers what to do

## Installing the Agent SDK

Create a new project:
```bash
mkdir test-generator
cd test-generator
uv init
uv add claude-agent-sdk anthropic
```

You'll also need an API key:
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

## What We're Building

A program that uses an AI helper to automatically write tests for your code!

## The Basic Pattern

Here's the simple pattern for using AI helpers:

```python
# 1. Import the SDK
from claude_agent_sdk import Agent, AgentConfig

# 2. Configure how the AI helper should work
config = AgentConfig(
    model="claude-sonnet-4.5",  # Which AI to use
    max_turns=10,               # How much thinking time
    timeout=90,                 # Maximum seconds to run
    temperature=0.3             # How creative (0 = consistent, 1 = creative)
)

# 3. Create the AI helper
agent = Agent(config=config)

# 4. Tell it what to do
result = await agent.run(prompt="Your instructions here")

# 5. Get the results
print(result.content)
```

## Understanding Async/Await

You'll see `async` and `await` in the code. Here's what they mean:

- `async def` - This function might take a while
- `await` - Wait for this to finish before continuing

Think of it like cooking:
- Regular code: Do one thing at a time (chop, then cook, then serve)
- Async code: Start something, do other things while it cooks, come back when it's done

AI helpers can take seconds or minutes, so we use `async` to not freeze our program!

## Complete Test Generator

```python
import asyncio
from pathlib import Path
from claude_agent_sdk import Agent, AgentConfig

async def generate_tests(file_path):
    """Generate tests for a Python file using an AI helper."""

    # Read the code
    with open(file_path, 'r') as f:
        code = f.read()

    # Create the instructions for the AI helper
    instructions = f"""
Look at this Python code and write pytest tests for it:

{code}

Write complete test cases that check if the code works correctly.
Include tests for normal cases and edge cases.
"""

    # Configure the AI helper
    config = AgentConfig(
        model="claude-sonnet-4.5",
        max_turns=10,
        timeout=90,
        temperature=0.3  # Lower = more consistent
    )

    # Create and run the AI helper
    agent = Agent(config=config)
    result = await agent.run(prompt=instructions)

    return result.content

# Main program
async def main():
    print("Generating tests for calculator.py...")

    tests = await generate_tests("calculator.py")

    # Save the tests
    with open("test_calculator.py", 'w') as f:
        f.write(tests)

    print("Done! Check test_calculator.py")

# Run it
if __name__ == "__main__":
    asyncio.run(main())
```

## Running Multiple AI Helpers at Once

The cool part about async code is you can run multiple AI helpers at the same time!

```python
async def generate_all_tests():
    """Generate tests for multiple files in parallel."""

    files = ["calculator.py", "utils.py", "helpers.py"]

    # Start all AI helpers at once
    tasks = [generate_tests(f) for f in files]

    # Wait for all of them to finish
    results = await asyncio.gather(*tasks)

    return results
```

This is like having 3 assistants working on different tasks at the same time instead of waiting for each one to finish!

## Configuration Options Explained

**model**: Which AI to use
- `claude-haiku-4.5` - Fastest and cheapest
- `claude-sonnet-4.5` - Balanced (good for most tasks)
- `claude-opus-4.6` - Most powerful (for hard tasks)

**max_turns**: How many steps the AI can take
- Low (3-5): Quick tasks
- Medium (8-12): Most tasks
- High (15+): Complex tasks

**timeout**: Maximum seconds before giving up
- Short (30-60): Simple tasks
- Medium (60-120): Normal tasks
- Long (120+): Complex analysis

**temperature**: How creative vs consistent
- 0.0-0.3: Very consistent (good for code)
- 0.4-0.6: Balanced
- 0.7-1.0: More creative (good for writing)

## What's Next?

Now you can create and control AI helpers from your code! In the next phase, you'll learn how to make MULTIPLE AI helpers work together as a team.

**Remember:**
1. Configure the AI helper (model, timeout, etc.)
2. Give it clear instructions
3. Wait for it to finish (`await`)
4. Use the results

You're building powerful automation tools!
