# Multi-Agent Orchestration

## Overview

Multi-agent orchestration coordinates multiple specialized AI agents to solve complex problems through collaboration. Each agent has a specific role, configuration, and objective, working together in a pipeline to achieve sophisticated outcomes that no single agent could handle efficiently.

## Key Concepts

1. **Specialized Agents**: Each agent configured for a specific task (analyzer, writer, reviewer, etc.)
2. **State Management**: Data structures that pass information between agents
3. **Orchestrator**: Your code that coordinates the workflow
4. **Pipeline Patterns**: Sequential, parallel, or hybrid execution strategies
5. **Result Aggregation**: Combining outputs from multiple agents

## Project: Documentation Pipeline

Build a documentation generator using four specialized agents:

1. **Analyzer Agent** - Extracts code structure and identifies functions/classes
2. **Writer Agent** - Generates clear, comprehensive documentation
3. **Reviewer Agent** - Checks accuracy and identifies gaps
4. **Editor Agent** - Polishes language and ensures consistency

## Architecture

```
┌────────────────────────────────────────────────────────┐
│              ORCHESTRATOR (Your Script)                 │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 1: ANALYZER AGENT                          │   │
│  │ Input: Source code                              │   │
│  │ Output: Structure analysis (JSON)               │   │
│  └─────────────────────────────────────────────────┘   │
│                        ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 2: WRITER AGENT                            │   │
│  │ Input: Analysis + code                          │   │
│  │ Output: Draft documentation                     │   │
│  └─────────────────────────────────────────────────┘   │
│                        ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 3: REVIEWER AGENT                          │   │
│  │ Input: Draft + code                             │   │
│  │ Output: Review feedback (JSON)                  │   │
│  └─────────────────────────────────────────────────┘   │
│                        ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 4: EDITOR AGENT                            │   │
│  │ Input: Draft + feedback                         │   │
│  │ Output: Final polished docs                     │   │
│  └─────────────────────────────────────────────────┘   │
│                        ↓                               │
│                   Final Output                         │
└────────────────────────────────────────────────────────┘
```

## Implementation

Create `doc_pipeline.py`:

```python
#!/usr/bin/env python3
"""
Multi-Agent Documentation Pipeline

Orchestrates four specialized agents to generate comprehensive
documentation from source code.
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, Any
from dataclasses import dataclass

# Conceptual Agent SDK import
try:
    from claude_agent_sdk import Agent, AgentConfig
except ImportError:
    print("Agent SDK required. Install with: uv add claude-agent-sdk")
    import sys
    sys.exit(1)


@dataclass
class PipelineState:
    """Shared state passed between agents."""
    source_file: Path
    source_code: str
    analysis: Dict[str, Any] = None
    draft_docs: str = None
    review_feedback: Dict[str, Any] = None
    final_docs: str = None


class DocumentationPipeline:
    """Orchestrates multi-agent documentation generation."""

    def __init__(self):
        """Initialize agent configurations."""
        # Analyzer: Fast model, focused on structure extraction
        self.analyzer_config = AgentConfig(
            model="claude-haiku-4.5",
            max_turns=5,
            timeout=60,
            temperature=0.2,
        )

        # Writer: Balanced model for content generation
        self.writer_config = AgentConfig(
            model="claude-sonnet-4.5",
            max_turns=10,
            timeout=90,
            temperature=0.5,
        )

        # Reviewer: High-quality model for accuracy checking
        self.reviewer_config = AgentConfig(
            model="claude-sonnet-4.5",
            max_turns=8,
            timeout=75,
            temperature=0.3,
        )

        # Editor: Balanced model for polishing
        self.editor_config = AgentConfig(
            model="claude-sonnet-4.5",
            max_turns=7,
            timeout=60,
            temperature=0.4,
        )

    async def step1_analyze(self, state: PipelineState) -> PipelineState:
        """Step 1: Analyze code structure."""
        print("📊 Step 1: Analyzing code structure...")

        prompt = f"""
Analyze the following Python code and extract its structure.

**File:** {state.source_file.name}

**Code:**
```python
{state.source_code}
```

**Task:**
Return a JSON object with:
- "purpose": Brief description of what this code does
- "functions": List of function names with brief descriptions
- "classes": List of class names with brief descriptions
- "imports": List of key imported modules
- "complexity": "simple", "moderate", or "complex"

Return ONLY valid JSON, no markdown formatting.
"""

        agent = Agent(config=self.analyzer_config)
        result = await agent.run(prompt=prompt)

        # Parse JSON response
        try:
            state.analysis = json.loads(result.content)
        except json.JSONDecodeError:
            state.analysis = {
                "purpose": "Analysis unavailable",
                "error": "Agent returned non-JSON response"
            }

        print(f"   ✅ Identified {len(state.analysis.get('functions', []))} functions")
        return state

    async def step2_write_docs(self, state: PipelineState) -> PipelineState:
        """Step 2: Generate documentation draft."""
        print("✍️  Step 2: Writing documentation draft...")

        analysis_summary = json.dumps(state.analysis, indent=2)

        prompt = f"""
Write comprehensive documentation for the following Python code.

**File:** {state.source_file.name}

**Analysis:**
```json
{analysis_summary}
```

**Code:**
```python
{state.source_code}
```

**Requirements:**
1. Start with a clear module-level docstring
2. Document each function and class
3. Include usage examples
4. Explain complex logic
5. Use clear, beginner-friendly language
6. Follow Google-style docstring format

Return ONLY the documentation content (markdown format), no meta-commentary.
"""

        agent = Agent(config=self.writer_config)
        result = await agent.run(prompt=prompt)

        state.draft_docs = result.content
        print(f"   ✅ Generated {len(state.draft_docs)} characters of documentation")
        return state

    async def step3_review_docs(self, state: PipelineState) -> PipelineState:
        """Step 3: Review documentation for accuracy and completeness."""
        print("🔍 Step 3: Reviewing documentation for accuracy...")

        prompt = f"""
Review the following documentation against the source code.

**File:** {state.source_file.name}

**Documentation:**
```markdown
{state.draft_docs}
```

**Source Code:**
```python
{state.source_code}
```

**Task:**
Return a JSON object with:
- "accurate": true/false - are docs technically accurate?
- "complete": true/false - are all functions/classes documented?
- "gaps": List of missing documentation elements
- "errors": List of inaccuracies or mistakes
- "suggestions": List of improvement suggestions
- "score": Overall quality score 1-10

Return ONLY valid JSON, no markdown formatting.
"""

        agent = Agent(config=self.reviewer_config)
        result = await agent.run(prompt=prompt)

        # Parse JSON response
        try:
            state.review_feedback = json.loads(result.content)
        except json.JSONDecodeError:
            state.review_feedback = {
                "score": 7,
                "note": "Review completed with non-JSON response"
            }

        score = state.review_feedback.get("score", "N/A")
        print(f"   ✅ Review score: {score}/10")
        return state

    async def step4_polish_docs(self, state: PipelineState) -> PipelineState:
        """Step 4: Polish documentation based on review feedback."""
        print("✨ Step 4: Polishing final documentation...")

        feedback_summary = json.dumps(state.review_feedback, indent=2)

        prompt = f"""
Polish the following documentation based on review feedback.

**Original Documentation:**
```markdown
{state.draft_docs}
```

**Review Feedback:**
```json
{feedback_summary}
```

**Task:**
1. Address all identified gaps and errors
2. Implement suggested improvements
3. Ensure consistent formatting
4. Polish language for clarity
5. Verify all code references are accurate

Return ONLY the final polished documentation (markdown), no meta-commentary.
"""

        agent = Agent(config=self.editor_config)
        result = await agent.run(prompt=prompt)

        state.final_docs = result.content
        print(f"   ✅ Final documentation ready ({len(state.final_docs)} characters)")
        return state

    async def run(self, source_file: Path) -> str:
        """Execute the complete documentation pipeline.

        Args:
            source_file: Path to Python source file

        Returns:
            Final polished documentation (markdown)
        """
        # Read source code
        with open(source_file, 'r', encoding='utf-8') as f:
            source_code = f.read()

        # Initialize pipeline state
        state = PipelineState(
            source_file=source_file,
            source_code=source_code
        )

        # Execute pipeline steps sequentially
        state = await self.step1_analyze(state)
        state = await self.step2_write_docs(state)
        state = await self.step3_review_docs(state)
        state = await self.step4_polish_docs(state)

        return state.final_docs


async def main():
    """Main entry point."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: uv run doc_pipeline.py <source_file.py>")
        sys.exit(1)

    source_file = Path(sys.argv[1])

    if not source_file.exists():
        print(f"Error: {source_file} not found")
        sys.exit(1)

    print(f"\n🚀 Documentation Pipeline Starting")
    print(f"📄 Source: {source_file}\n")

    pipeline = DocumentationPipeline()

    try:
        final_docs = await pipeline.run(source_file)

        # Write output
        output_file = source_file.with_suffix('.md')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(final_docs)

        print(f"\n✅ Pipeline Complete!")
        print(f"📝 Documentation written to: {output_file}\n")

    except Exception as e:
        print(f"\n❌ Pipeline failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
```

## Key Orchestration Patterns

### 1. Specialized Agent Configurations

```python
# Fast agent for quick analysis
analyzer_config = AgentConfig(
    model="claude-haiku-4.5",
    temperature=0.2
)

# Powerful agent for content generation
writer_config = AgentConfig(
    model="claude-sonnet-4.5",
    temperature=0.5
)
```

Match agent capability to task requirements:
- Simple tasks → Haiku (fast, cheap)
- Complex tasks → Sonnet or Opus (capable, thorough)

### 2. State Management

```python
@dataclass
class PipelineState:
    """Shared state passed between agents."""
    source_code: str
    analysis: Dict = None
    draft_docs: str = None
    # ...
```

State objects accumulate results as they flow through the pipeline.

### 3. Sequential Pipeline Execution

```python
state = await self.step1_analyze(state)
state = await self.step2_write_docs(state)
state = await self.step3_review_docs(state)
state = await self.step4_polish_docs(state)
```

Each step depends on previous output and must run sequentially.

### 4. Structured Agent Communication

```python
# Analyzer returns JSON
state.analysis = json.loads(result.content)

# Writer receives JSON and produces markdown
# Reviewer receives markdown and produces JSON
# Editor receives both and produces final markdown
```

Structured formats (JSON) enable reliable inter-agent communication.

## Running the Pipeline

Create a sample Python file:

```bash
cat > sample.py << 'EOF'
import hashlib
from typing import Optional

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hash a password with optional salt."""
    if salt is None:
        salt = "default_salt"
    combined = f"{password}{salt}"
    return hashlib.sha256(combined.encode()).hexdigest()

class UserManager:
    """Manages user authentication."""

    def __init__(self):
        self.users = {}

    def create_user(self, username: str, password: str):
        """Create a new user with hashed password."""
        hashed_pw = hash_password(password)
        self.users[username] = hashed_pw

    def verify_user(self, username: str, password: str) -> bool:
        """Verify user credentials."""
        if username not in self.users:
            return False
        return self.users[username] == hash_password(password)
EOF
```

Run the pipeline:

```bash
chmod +x doc_pipeline.py
uv run doc_pipeline.py sample.py
```

Expected output:

```
🚀 Documentation Pipeline Starting
📄 Source: sample.py

📊 Step 1: Analyzing code structure...
   ✅ Identified 2 functions
✍️  Step 2: Writing documentation draft...
   ✅ Generated 1847 characters of documentation
🔍 Step 3: Reviewing documentation for accuracy...
   ✅ Review score: 9/10
✨ Step 4: Polishing final documentation...
   ✅ Final documentation ready (2103 characters)

✅ Pipeline Complete!
📝 Documentation written to: sample.md
```

Inspect generated documentation:

```bash
cat sample.md
```

## Advanced: Parallel Steps

Some pipeline steps can run in parallel. For example, generating docs for multiple files:

```python
async def process_multiple_files(file_paths: List[Path]):
    """Process multiple files in parallel."""
    pipeline = DocumentationPipeline()

    # Run pipelines in parallel
    tasks = [pipeline.run(fp) for fp in file_paths]
    results = await asyncio.gather(*tasks)

    return results
```

Hybrid pattern: Parallel at the file level, sequential within each file's pipeline.

## Validation Requirements

Your implementation must:
1. Define 3 or more specialized agents with different configurations
2. Implement state management (dataclass or dict)
3. Execute agents sequentially with state passing
4. Aggregate results from multiple agents
5. Handle errors at each pipeline stage
6. Produce meaningful final output

## Best Practices

### Do
- Use specialized agents for different tasks
- Configure agents appropriately (model, temperature, max_turns)
- Manage state explicitly (dataclasses, typed dicts)
- Handle errors at each stage
- Log agent invocations and results
- Use structured formats (JSON) for inter-agent communication

### Don't
- Use the same configuration for all agents
- Pass unstructured text between agents
- Ignore intermediate failures
- Run long pipelines without checkpoints
- Over-engineer (start simple, add complexity as needed)
