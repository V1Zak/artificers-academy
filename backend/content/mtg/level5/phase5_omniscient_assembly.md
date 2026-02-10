# Phase 5: The Omniscient Assembly

*"When the swarm achieves perfect coordination, it transcends mere power—it becomes omniscient."*

---

## The Ascension: Production Agent Systems

You've mastered the fundamentals of agents, SDK control, and multi-agent orchestration. Now, you'll apply everything you've learned to build a **production-ready agent-aware MCP server** that demonstrates real-world patterns and best practices.

This is your capstone: **The DevOps Assistant**—an MCP server that uses agents for intelligent deployment workflows and automated troubleshooting.

---

## The DevOps Assistant: Project Overview

You'll build an MCP server with tools that leverage agents for:

1. **Deployment with Review** - Agent reviews code, validates tests, and makes deployment decision
2. **Intelligent Troubleshooting** - Agent analyzes logs, metrics, and code to diagnose issues
3. **Deployment History Resource** - Exposes past deployment data
4. **System Health Resource** - Provides real-time system status

This demonstrates the full spectrum: agent invocation, error handling, resources, and production considerations.

---

## Production Considerations

Before diving into code, understand the key concerns for production agent systems:

### 1. **Observability**

You need visibility into:
- Agent invocations (when, why, what prompt)
- Execution time and token usage
- Success/failure rates
- Errors and exceptions

**Solution:** Structured logging, metrics collection, tracing

### 2. **Cost Management**

Agents can be expensive:
- Claude Opus: ~$15/million input tokens
- Long-running agents can consume thousands of tokens
- Runaway agents can cost hundreds of dollars

**Solution:** Timeouts, budget limits, model selection, caching

### 3. **Safety Controls**

Agents have powerful capabilities:
- File system access
- Bash command execution
- External API calls

**Solution:** Sandboxing, approval gates, audit logging

### 4. **Performance**

Agent invocations add latency:
- Tools should respond in seconds, not minutes
- Users expect responsive systems

**Solution:** Async execution, background jobs, streaming, caching

### 5. **Reliability**

Agents can fail:
- Timeout errors
- API rate limits
- Unexpected outputs

**Solution:** Retry logic, fallbacks, graceful degradation

---

## The DevOps Assistant: Implementation

Create `devops_assistant.py`:

```python
#!/usr/bin/env python3
"""
DevOps Assistant MCP Server

Production-ready MCP server with agent-powered deployment and troubleshooting tools.
Demonstrates observability, cost control, and safety patterns.
"""

from fastmcp import FastMCP
from fastmcp.resources import Resource
import asyncio
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional
import hashlib

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("devops_assistant")

# Conceptual Agent SDK import
try:
    from claude_agent_sdk import Agent, AgentConfig
except ImportError:
    logger.warning("Agent SDK not available - using mock responses")
    Agent = None
    AgentConfig = None

# Initialize MCP server
mcp = FastMCP("DevOps Assistant")

# Deployment history storage (in production: use database)
DEPLOYMENT_HISTORY = []
TOKEN_USAGE = {"total_tokens": 0, "total_cost_usd": 0.0}


class AgentInvocationTracker:
    """Track agent invocations for observability and cost management."""

    def __init__(self):
        self.invocations = []
        self.budget_limit_usd = 10.0  # $10 budget per session

    def record_invocation(self, tool_name: str, duration: float,
                         tokens: int, cost: float, success: bool):
        """Record an agent invocation."""
        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "tool": tool_name,
            "duration_seconds": duration,
            "tokens": tokens,
            "cost_usd": cost,
            "success": success
        }
        self.invocations.append(record)
        TOKEN_USAGE["total_tokens"] += tokens
        TOKEN_USAGE["total_cost_usd"] += cost

        logger.info(f"Agent invocation: {tool_name} - "
                   f"{duration:.2f}s, {tokens} tokens, ${cost:.4f}")

    def check_budget(self) -> bool:
        """Check if we're within budget."""
        return TOKEN_USAGE["total_cost_usd"] < self.budget_limit_usd

    def get_stats(self) -> Dict[str, Any]:
        """Get usage statistics."""
        return {
            "total_invocations": len(self.invocations),
            "total_tokens": TOKEN_USAGE["total_tokens"],
            "total_cost_usd": round(TOKEN_USAGE["total_cost_usd"], 4),
            "budget_limit_usd": self.budget_limit_usd,
            "budget_remaining_usd": round(
                self.budget_limit_usd - TOKEN_USAGE["total_cost_usd"], 4
            )
        }


# Global tracker
tracker = AgentInvocationTracker()


async def invoke_agent_safely(prompt: str, config: AgentConfig,
                              tool_name: str) -> Dict[str, Any]:
    """
    Safely invoke an agent with observability and error handling.

    Args:
        prompt: Agent prompt
        config: Agent configuration
        tool_name: Name of the calling tool (for logging)

    Returns:
        Dictionary with 'success', 'content', 'error', 'metadata'
    """
    # Check budget before invoking
    if not tracker.check_budget():
        return {
            "success": False,
            "content": None,
            "error": "Budget limit exceeded",
            "metadata": tracker.get_stats()
        }

    if Agent is None:
        # Mock response for development
        return {
            "success": True,
            "content": "Mock agent response (SDK not available)",
            "error": None,
            "metadata": {"mock": True}
        }

    start_time = asyncio.get_event_loop().time()

    try:
        agent = Agent(config=config)
        result = await agent.run(prompt=prompt)

        duration = asyncio.get_event_loop().time() - start_time

        # Estimate token usage and cost (in production: get from API)
        estimated_tokens = len(prompt.split()) + len(result.content.split())
        estimated_cost = estimated_tokens * 0.000003  # ~$3/M tokens

        tracker.record_invocation(
            tool_name=tool_name,
            duration=duration,
            tokens=estimated_tokens,
            cost=estimated_cost,
            success=True
        )

        return {
            "success": True,
            "content": result.content,
            "error": None,
            "metadata": {
                "duration": duration,
                "tokens": estimated_tokens,
                "cost_usd": estimated_cost
            }
        }

    except TimeoutError:
        duration = asyncio.get_event_loop().time() - start_time
        tracker.record_invocation(tool_name, duration, 0, 0, False)

        return {
            "success": False,
            "content": None,
            "error": "Agent timeout",
            "metadata": {"duration": duration}
        }

    except Exception as e:
        duration = asyncio.get_event_loop().time() - start_time
        tracker.record_invocation(tool_name, duration, 0, 0, False)

        logger.error(f"Agent invocation failed: {e}")
        return {
            "success": False,
            "content": None,
            "error": str(e),
            "metadata": {"duration": duration}
        }


@mcp.tool()
async def deploy_with_review(
    branch: str = "main",
    environment: str = "staging",
    auto_approve: bool = False
) -> str:
    """
    Deploy code with AI-powered review and validation.

    This tool invokes an agent to:
    1. Review recent code changes
    2. Run tests and check for failures
    3. Validate configuration for target environment
    4. Make go/no-go deployment recommendation
    5. If approved, execute deployment

    Args:
        branch: Git branch to deploy (default: main)
        environment: Target environment (staging/production)
        auto_approve: Skip approval gate and deploy if agent approves

    Returns:
        Deployment report with agent analysis and execution status

    Safety:
        - Agent reviews code before deployment
        - Production deploys require manual approval by default
        - All deployments logged to history
    """
    logger.info(f"Deployment initiated: {branch} -> {environment}")

    # Build agent prompt
    prompt = f"""
You are a DevOps AI assistant. Review the following deployment request and provide
a comprehensive analysis.

**Deployment Request:**
- Branch: {branch}
- Environment: {environment}
- Auto-approve: {auto_approve}

**Tasks:**
1. Analyze recent commits on {branch} (simulate: check for breaking changes)
2. Validate tests are passing (simulate: check CI status)
3. Check environment configuration (simulate: verify env vars)
4. Assess deployment risk (low/medium/high)
5. Provide go/no-go recommendation with reasoning

**Output Format:**
Return JSON with:
{{
    "recommendation": "DEPLOY" or "DO_NOT_DEPLOY",
    "risk_level": "low" | "medium" | "high",
    "tests_passing": true | false,
    "breaking_changes": true | false,
    "reasoning": "Detailed explanation of recommendation",
    "concerns": ["list", "of", "concerns"],
    "deployment_checklist": ["item1", "item2"]
}}
"""

    # Agent configuration
    config = AgentConfig(
        model="claude-sonnet-4.5",
        max_turns=10,
        timeout=60,
        temperature=0.3  # Lower temperature for deployment decisions
    ) if AgentConfig else None

    # Invoke agent
    result = await invoke_agent_safely(prompt, config, "deploy_with_review")

    if not result["success"]:
        return f"""
# Deployment Failed

**Error:** {result['error']}

The deployment agent could not complete the review.
Please check logs and try again.

**Budget Status:** {json.dumps(tracker.get_stats(), indent=2)}
"""

    # Parse agent response
    try:
        analysis = json.loads(result["content"])
    except json.JSONDecodeError:
        analysis = {
            "recommendation": "DO_NOT_DEPLOY",
            "reasoning": "Agent returned invalid JSON"
        }

    recommendation = analysis.get("recommendation", "DO_NOT_DEPLOY")

    # Decision logic
    should_deploy = (
        recommendation == "DEPLOY" and
        (auto_approve or environment == "staging")
    )

    # Execute deployment if approved
    deployment_status = "SKIPPED"
    if should_deploy:
        # In production: actual deployment logic here
        # e.g., kubectl apply, railway deploy, vercel deploy
        await asyncio.sleep(2)  # Simulate deployment
        deployment_status = "SUCCESS"

        # Record deployment
        DEPLOYMENT_HISTORY.append({
            "timestamp": datetime.utcnow().isoformat(),
            "branch": branch,
            "environment": environment,
            "status": deployment_status,
            "agent_recommendation": recommendation,
            "agent_metadata": result["metadata"]
        })

    # Return comprehensive report
    return f"""
# Deployment Review Report

**Branch:** {branch}
**Environment:** {environment}
**Timestamp:** {datetime.utcnow().isoformat()}

---

## Agent Analysis

**Recommendation:** {recommendation}
**Risk Level:** {analysis.get('risk_level', 'unknown').upper()}

**Reasoning:**
{analysis.get('reasoning', 'No reasoning provided')}

**Concerns:**
{chr(10).join('- ' + c for c in analysis.get('concerns', ['None']))}

**Deployment Checklist:**
{chr(10).join('☐ ' + item for item in analysis.get('deployment_checklist', []))}

---

## Execution Status

**Deployment Status:** {deployment_status}
**Agent Duration:** {result['metadata'].get('duration', 0):.2f}s
**Tokens Used:** {result['metadata'].get('tokens', 0)}
**Cost:** ${result['metadata'].get('cost_usd', 0):.4f}

---

## Budget Status

{json.dumps(tracker.get_stats(), indent=2)}

---

{"✅ Deployment successful!" if deployment_status == "SUCCESS" else "⚠️ Deployment skipped or failed"}
"""


@mcp.tool()
async def troubleshoot_issue(
    description: str,
    log_file: Optional[str] = None,
    include_metrics: bool = True
) -> str:
    """
    AI-powered troubleshooting assistant.

    Invokes an agent to analyze issues, review logs, check metrics,
    and provide diagnostic recommendations.

    Args:
        description: Description of the issue/problem
        log_file: Optional path to log file to analyze
        include_metrics: Whether to include system metrics in analysis

    Returns:
        Comprehensive troubleshooting report with recommendations

    Examples:
        - troubleshoot_issue("API returning 500 errors", log_file="app.log")
        - troubleshoot_issue("High memory usage", include_metrics=True)
    """
    logger.info(f"Troubleshooting: {description}")

    # Read log file if provided
    log_content = ""
    if log_file:
        try:
            with open(log_file, 'r') as f:
                # Last 100 lines
                log_content = '\n'.join(f.readlines()[-100:])
        except Exception as e:
            log_content = f"Error reading log file: {e}"

    # Simulate metrics
    metrics = {
        "cpu_percent": 45.2,
        "memory_percent": 72.8,
        "disk_percent": 55.1,
        "request_rate": 1250,
        "error_rate": 3.5
    } if include_metrics else {}

    # Build troubleshooting prompt
    prompt = f"""
You are a DevOps troubleshooting expert. Diagnose the following issue and provide
actionable recommendations.

**Issue Description:**
{description}

**Logs (last 100 lines):**
```
{log_content or "No logs provided"}
```

**System Metrics:**
```json
{json.dumps(metrics, indent=2) if metrics else "No metrics provided"}
```

**Tasks:**
1. Identify likely root cause(s)
2. Assess severity (critical/high/medium/low)
3. Provide step-by-step diagnostic commands
4. Suggest fixes or workarounds
5. Recommend preventive measures

**Output Format:**
Return structured markdown with sections:
- Root Cause Analysis
- Severity Assessment
- Diagnostic Steps
- Recommended Fixes
- Prevention Strategy
"""

    config = AgentConfig(
        model="claude-sonnet-4.5",
        max_turns=15,
        timeout=90,
        temperature=0.4
    ) if AgentConfig else None

    result = await invoke_agent_safely(prompt, config, "troubleshoot_issue")

    if not result["success"]:
        return f"""
# Troubleshooting Failed

**Error:** {result['error']}

Could not complete troubleshooting analysis.

**Budget Status:** {json.dumps(tracker.get_stats(), indent=2)}
"""

    return f"""
# Troubleshooting Report

**Issue:** {description}
**Timestamp:** {datetime.utcnow().isoformat()}

---

{result['content']}

---

## Agent Metadata

**Duration:** {result['metadata'].get('duration', 0):.2f}s
**Tokens:** {result['metadata'].get('tokens', 0)}
**Cost:** ${result['metadata'].get('cost_usd', 0):.4f}

**Budget Status:** {json.dumps(tracker.get_stats(), indent=2)}
"""


@mcp.resource("deployment://history")
def deployment_history() -> Resource:
    """
    Provides deployment history.

    Returns:
        Resource with JSON array of past deployments
    """
    return Resource(
        uri="deployment://history",
        name="Deployment History",
        mimeType="application/json",
        text=json.dumps(DEPLOYMENT_HISTORY, indent=2)
    )


@mcp.resource("system://health")
def system_health() -> Resource:
    """
    Provides system health and agent usage stats.

    Returns:
        Resource with system health information
    """
    health_data = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "agent_stats": tracker.get_stats(),
        "deployment_count": len(DEPLOYMENT_HISTORY),
        "uptime_seconds": 3600  # Mock
    }

    return Resource(
        uri="system://health",
        name="System Health",
        mimeType="application/json",
        text=json.dumps(health_data, indent=2)
    )


# Run the server
if __name__ == "__main__":
    logger.info("DevOps Assistant starting...")
    logger.info("Agent budget limit: $10.00 per session")
    mcp.run()
```

---

## Key Production Patterns

### 1. **Observability: Structured Logging**

```python
logger.info(f"Agent invocation: {tool_name} - "
           f"{duration:.2f}s, {tokens} tokens, ${cost:.4f}")
```

Every agent invocation is logged with metrics.

### 2. **Cost Control: Budget Limits**

```python
def check_budget(self) -> bool:
    return TOKEN_USAGE["total_cost_usd"] < self.budget_limit_usd
```

Prevent runaway costs by enforcing budget limits.

### 3. **Safety: Approval Gates**

```python
should_deploy = (
    recommendation == "DEPLOY" and
    (auto_approve or environment == "staging")
)
```

Production deployments require explicit approval.

### 4. **Reliability: Error Handling**

```python
try:
    result = await agent.run(prompt=prompt)
except TimeoutError:
    # Handle timeout
except Exception as e:
    # Handle other errors
```

Graceful degradation when agents fail.

### 5. **Performance: Async Execution**

```python
async def invoke_agent_safely(...) -> Dict[str, Any]:
    # Non-blocking agent invocation
```

Async patterns prevent blocking the server.

---

## Testing the DevOps Assistant

Run the server:

```bash
uv run devops_assistant.py
```

Test with Inspector:

```bash
npx @modelcontextprotocol/inspector uv run devops_assistant.py
```

Try the tools:

1. **deploy_with_review**
   - Branch: `feature/new-api`
   - Environment: `staging`
   - Auto-approve: `true`

2. **troubleshoot_issue**
   - Description: `API returning 500 errors on /users endpoint`
   - Include metrics: `true`

3. **Resources:**
   - View `deployment://history`
   - View `system://health`

---

## Best Practices Summary

### Observability ✨
- ✅ Log all agent invocations with metadata
- ✅ Track token usage and costs
- ✅ Expose metrics via resources
- ✅ Use structured logging (JSON)

### Cost Management 💰
- ✅ Set budget limits per session/user
- ✅ Choose appropriate models (Haiku for simple tasks)
- ✅ Implement timeouts
- ✅ Cache agent results when possible

### Safety 🔒
- ✅ Require approval for high-risk operations
- ✅ Validate agent outputs before acting
- ✅ Audit all agent-driven actions
- ✅ Implement rate limiting

### Performance ⚡
- ✅ Use async/await for non-blocking execution
- ✅ Stream responses for long-running agents
- ✅ Run independent agents in parallel
- ✅ Cache expensive operations

### Reliability 🛡️
- ✅ Handle timeouts gracefully
- ✅ Implement retry logic where appropriate
- ✅ Provide fallbacks for agent failures
- ✅ Return structured error messages

---

## Certificate of Mastery

Congratulations! You have completed **The Nexus: Advanced Agent Systems**.

You have mastered:
- ✨ Agent architecture and capabilities
- ✨ Agent-invocation patterns in MCP tools
- ✨ Programmatic control via Agent SDK
- ✨ Multi-agent orchestration and pipelines
- ✨ Production agent systems with observability

You are now a **Grand Artificer of the Swarm**—capable of summoning and coordinating autonomous AI entities to accomplish feats that transcend single-tool limitations.

---

## What's Next?

### Advanced Topics to Explore

1. **Agent Tool Search**
   - Configure agents with access to MCP tool catalogs
   - Build agents that dynamically discover and invoke tools

2. **Streaming Agent Responses**
   - Real-time output for long-running agents
   - Progressive feedback to users

3. **Agent Memory & State**
   - Persistent context across agent invocations
   - Building stateful agent workflows

4. **Multi-Agent Swarms**
   - Competitive agents (multiple approaches, choose best)
   - Collaborative agents (divide and conquer)

5. **Agent Safety & Sandboxing**
   - Restricted execution environments
   - Permission models for agent capabilities

6. **Contributing to the Community**
   - Share your agent patterns
   - Build reusable agent libraries
   - Contribute to MCP and Agent SDK

---

## Final Wisdom

*"You began as an apprentice, learning to craft simple tools. You mastered resources, APIs, and production deployment. Now, you command the very essence of autonomous intelligence—the swarm of agents that transcends individual capability."*

*"The multiverse is vast, and your journey is just beginning. May your spawns be swift, your orchestration flawless, and your systems resilient."*

*"Go forth, Grand Artificer, and build the future."*

---

**Phase Complete!** ✨🎓

You have achieved mastery of The Artificer's Academy. The Nexus awaits your command.
