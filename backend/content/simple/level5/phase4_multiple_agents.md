# Multiple Agents Working Together

## Why Use Multiple AI Helpers?

Sometimes a task is too complex for one AI helper. Instead, you can create a **team** of AI helpers where each one is good at one specific thing!

Think of it like a kitchen:
- **One cook** trying to make a 5-course meal: Stressed, might forget things
- **Team of specialists**: One preps, one cooks, one plates, one checks quality - faster and better results!

## The Documentation Team

We'll build a system with 4 AI helpers that work together to create great documentation:

1. **Analyzer** - Reads code and figures out what it does
2. **Writer** - Creates the documentation
3. **Reviewer** - Checks if the documentation is accurate
4. **Editor** - Makes the final documentation clear and polished

## How They Work Together

```
Your Code
   ↓
Analyzer AI → Understands the code
   ↓
Writer AI → Creates first draft docs
   ↓
Reviewer AI → Checks for mistakes
   ↓
Editor AI → Polishes the final version
   ↓
Perfect Documentation!
```

Each AI helper does one job really well, then passes its work to the next one.

## Building the System

```python
import asyncio
from claude_agent_sdk import Agent, AgentConfig

class DocumentationTeam:
    """A team of AI helpers that create documentation together."""

    def __init__(self):
        """Set up our 4 team members."""

        # Analyzer: Fast AI for quick analysis
        self.analyzer_config = AgentConfig(
            model="claude-haiku-4.5",  # Fast model
            max_turns=5,
            timeout=60,
            temperature=0.2
        )

        # Writer: Balanced AI for writing
        self.writer_config = AgentConfig(
            model="claude-sonnet-4.5",
            max_turns=10,
            timeout=90,
            temperature=0.5
        )

        # Reviewer: Careful AI for checking
        self.reviewer_config = AgentConfig(
            model="claude-sonnet-4.5",
            max_turns=8,
            timeout=75,
            temperature=0.3
        )

        # Editor: Polishing AI
        self.editor_config = AgentConfig(
            model="claude-sonnet-4.5",
            max_turns=7,
            timeout=60,
            temperature=0.4
        )

    async def step1_analyze(self, code):
        """Step 1: Analyzer figures out what the code does."""
        print("📊 Analyzing code...")

        agent = Agent(config=self.analyzer_config)
        result = await agent.run(prompt=f"""
Analyze this code and describe:
1. What it does
2. Main functions
3. Main classes

Code:
{code}

Return a simple summary.
""")
        return result.content

    async def step2_write(self, code, analysis):
        """Step 2: Writer creates the documentation."""
        print("✍️  Writing documentation...")

        agent = Agent(config=self.writer_config)
        result = await agent.run(prompt=f"""
Write clear documentation for this code.

Analysis:
{analysis}

Code:
{code}

Make it beginner-friendly with examples.
""")
        return result.content

    async def step3_review(self, docs, code):
        """Step 3: Reviewer checks the documentation."""
        print("🔍 Reviewing documentation...")

        agent = Agent(config=self.reviewer_config)
        result = await agent.run(prompt=f"""
Review this documentation against the code.

Documentation:
{docs}

Code:
{code}

List any mistakes or missing information.
""")
        return result.content

    async def step4_edit(self, docs, review):
        """Step 4: Editor polishes the final version."""
        print("✨ Polishing documentation...")

        agent = Agent(config=self.editor_config)
        result = await agent.run(prompt=f"""
Improve this documentation based on the review feedback.

Documentation:
{docs}

Review feedback:
{review}

Return the final polished version.
""")
        return result.content

    async def create_docs(self, code_file):
        """Run the whole team to create documentation."""
        # Read the code
        with open(code_file, 'r') as f:
            code = f.read()

        # Run each AI helper in order
        analysis = await self.step1_analyze(code)
        draft = await self.step2_write(code, analysis)
        review = await self.step3_review(draft, code)
        final = await self.step4_edit(draft, review)

        return final

# Use it
async def main():
    team = DocumentationTeam()
    docs = await team.create_docs("my_code.py")

    # Save the result
    with open("documentation.md", 'w') as f:
        f.write(docs)

    print("✅ Done! Check documentation.md")

if __name__ == "__main__":
    asyncio.run(main())
```

## Key Ideas

### Each AI Helper Has a Job

```python
self.analyzer_config = AgentConfig(
    model="claude-haiku-4.5",  # Fast model for simple analysis
    temperature=0.2             # Very consistent
)

self.writer_config = AgentConfig(
    model="claude-sonnet-4.5",  # Smarter model for writing
    temperature=0.5             # Balanced creativity
)
```

**Why different configs?** Because different jobs need different skills!

### Passing Information Between AI Helpers

```python
analysis = await self.step1_analyze(code)     # Analyzer creates analysis
draft = await self.step2_write(code, analysis)  # Writer uses that analysis
```

Each AI helper takes the previous one's work and builds on it.

### Running in Order

```python
# They must run in this order:
step1 → step2 → step3 → step4
```

Each step needs the previous step's results, so they can't run at the same time.

## When to Run AI Helpers in Parallel

If you have INDEPENDENT tasks, run them at the same time:

```python
# Creating docs for 3 different files - they don't depend on each other!
tasks = [
    team.create_docs("file1.py"),
    team.create_docs("file2.py"),
    team.create_docs("file3.py")
]

# Run all 3 teams at once
results = await asyncio.gather(*tasks)
```

## What You've Learned

- Multiple AI helpers can work as a **team**
- Each AI helper can be configured differently for its job
- They pass information to each other
- Some run in **order** (when they depend on each other)
- Some run in **parallel** (when they're independent)

## What's Next?

Now you know how to orchestrate AI helper teams! In the final phase, you'll learn how to build production-ready systems that people can actually use in the real world.

**Remember:** Teams of specialists are more powerful than one generalist!
