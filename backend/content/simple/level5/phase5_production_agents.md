# Building Real Agent Systems

## What Makes a System "Production-Ready"?

**Production-ready** means real people can use your system reliably. It needs to be:

- **Safe** - Won't do dangerous things
- **Fast enough** - Responds in reasonable time
- **Affordable** - Won't cost too much money
- **Reliable** - Handles errors gracefully
- **Observable** - You can see what's happening

Think of it like a car:
- **Prototype**: Gets you from A to B (maybe)
- **Production car**: Safe, reliable, has warnings when something's wrong, doesn't explode randomly

## Important Things to Watch For

### 1. Cost (Money!)

AI helpers use tokens (think of them as "thinking units"). More thinking = more money.

**Example costs:**
- Simple question: $0.001 (less than a penny)
- Complex analysis: $0.10 (10 cents)
- Really complex task: $1.00 (a dollar)

**How to save money:**
- Use faster, cheaper AI models when you can
- Set a budget limit (like "stop if we spend more than $10")
- Set timeouts (don't let AI helpers run forever)

### 2. Speed (Time!)

Users don't want to wait forever.

**Typical times:**
- Regular tool: Instant to 1 second
- Simple AI helper: 5-15 seconds
- Complex AI helper: 30-60 seconds
- Multi-agent team: 1-3 minutes

**How to stay fast:**
- Only use AI helpers when you need them
- Show progress ("Analyzing... Reviewing... Almost done!")
- Run independent AI helpers at the same time

### 3. Safety (Don't Break Things!)

AI helpers can:
- Read and write files
- Run commands
- Make changes to your system

**How to stay safe:**
- Ask for approval before doing risky things
- Log everything the AI does
- Set limits on what it can do
- Test in a safe environment first

### 4. Reliability (Handle Errors!)

Things go wrong:
- AI helper takes too long (timeout)
- AI gives unexpected output
- Internet connection fails

**How to be reliable:**
- Always use `try/except` to catch errors
- Give helpful error messages
- Have a plan B when things fail

## Building a DevOps Assistant

Let's build a real production system! This will be an MCP server that helps with deployments.

```python
from fastmcp import FastMCP
import asyncio
from datetime import datetime

mcp = FastMCP("DevOps Assistant")

# Track how much we're spending
budget_used = 0.0
budget_limit = 10.0  # $10 limit

def check_budget():
    """Make sure we haven't spent too much."""
    return budget_used < budget_limit

@mcp.tool()
async def deploy_with_review(branch: str, environment: str) -> str:
    """
    Deploy code after AI review.

    The AI helper will:
    1. Check your recent code changes
    2. Make sure tests are passing
    3. Recommend whether to deploy or not
    4. If safe, do the deployment

    branch: Which code branch to deploy
    environment: Where to deploy (staging or production)
    """
    # Safety check: Don't go over budget
    if not check_budget():
        return "❌ Budget limit reached. Cannot deploy."

    print(f"🚀 Starting deployment review for {branch}...")

    # In a real system, this would:
    # 1. Create an AI helper
    # 2. Give it instructions to review the code
    # 3. Get its recommendation
    # 4. If approved, do the deployment

    # For this example:
    result = f"""
Deployment Review Complete
==========================

Branch: {branch}
Environment: {environment}
Time: {datetime.now()}

AI Helper Analysis:
✅ Code changes look good
✅ Tests are passing
✅ No security concerns found

Recommendation: SAFE TO DEPLOY

Deployment Status: SUCCESS

Budget used so far: ${budget_used:.2f} / ${budget_limit:.2f}
"""

    return result

@mcp.tool()
async def troubleshoot(problem: str) -> str:
    """
    Get AI help to troubleshoot a problem.

    The AI will analyze the issue and suggest solutions.

    problem: Description of what's wrong
    """
    if not check_budget():
        return "❌ Budget limit reached. Cannot troubleshoot."

    print(f"🔍 Analyzing problem: {problem}")

    # In a real system, the AI helper would:
    # 1. Read relevant log files
    # 2. Check system metrics
    # 3. Analyze the problem
    # 4. Suggest solutions

    result = f"""
Troubleshooting Report
=====================

Problem: {problem}
Analysis Time: {datetime.now()}

AI Helper Findings:
- Checked system logs
- Reviewed error patterns
- Analyzed recent changes

Suggested Solutions:
1. [AI would provide specific solutions here]
2. [Based on the actual problem]
3. [With step-by-step instructions]

Budget used: ${budget_used:.2f} / ${budget_limit:.2f}
"""

    return result

if __name__ == "__main__":
    print("DevOps Assistant starting...")
    print(f"Budget limit: ${budget_limit}")
    mcp.run()
```

## Key Production Patterns

### 1. Budget Limits

```python
budget_used = 0.0
budget_limit = 10.0

def check_budget():
    return budget_used < budget_limit
```

**Why?** Prevents runaway costs. Always know when to stop!

### 2. Clear Status Messages

```python
print(f"🚀 Starting deployment review...")
print(f"🔍 Analyzing problem...")
```

**Why?** Users want to know what's happening!

### 3. Timeouts

```python
config = AgentConfig(
    timeout=90  # Give up after 90 seconds
)
```

**Why?** Don't wait forever. Better to fail fast and retry.

### 4. Error Handling

```python
try:
    result = await agent.run(prompt)
except TimeoutError:
    return "⏱️  Took too long, please try again"
except Exception as e:
    return f"❌ Error: {e}"
```

**Why?** Graceful failures are better than crashes!

### 5. Logging

```python
print(f"Agent started: {datetime.now()}")
print(f"Agent finished: {datetime.now()}")
print(f"Cost: ${cost:.2f}")
```

**Why?** You need to know what happened when things go wrong!

## Best Practices Checklist

When building production AI helper systems:

**Cost:**
- ✅ Set a budget limit
- ✅ Track spending
- ✅ Use cheaper models when possible
- ✅ Set timeouts

**Safety:**
- ✅ Ask before doing risky things
- ✅ Log all actions
- ✅ Test in staging first
- ✅ Have approval gates

**Speed:**
- ✅ Show progress to users
- ✅ Run parallel when possible
- ✅ Set reasonable timeouts
- ✅ Cache results when you can

**Reliability:**
- ✅ Handle errors gracefully
- ✅ Give helpful error messages
- ✅ Have fallbacks
- ✅ Test edge cases

## Congratulations! 🎓

You've completed The Artificer's Academy!

**You learned:**
1. ✨ What AI helpers (agents) are and when to use them
2. ✨ How to build tools that use AI helpers
3. ✨ How to control AI helpers from your code
4. ✨ How to make teams of AI helpers work together
5. ✨ How to build production-ready systems

**You can now:**
- Build sophisticated automation tools
- Use AI to analyze, review, and generate code
- Orchestrate teams of AI helpers
- Deploy systems that people can rely on

## What's Next?

Keep building! Here are some ideas:

**Beginner Projects:**
- Code review bot for your projects
- Automated test generator
- Documentation creator

**Intermediate Projects:**
- Multi-file refactoring assistant
- Automated bug finder and fixer
- Development environment setup automation

**Advanced Projects:**
- Full CI/CD pipeline with AI review
- Intelligent monitoring and alerting
- Automated performance optimization

## Final Advice

1. **Start simple** - Get one AI helper working before building teams
2. **Test everything** - AI can be unpredictable, test your systems well
3. **Watch your costs** - Always set budget limits when learning
4. **Be patient** - AI helpers take time, but they're worth it
5. **Have fun** - You're building the future of software development!

**Remember:** You started knowing nothing about MCP and AI helpers. Look how far you've come!

Now go build amazing things! 🚀

---

**Course Complete!** ✨

You are now ready to build production AI helper systems. The future is yours to create!
