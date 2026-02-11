# Phase 6: Claude Code Agent Teams

## Overview

Agent teams are an experimental Claude Code feature enabling multiple independent Claude sessions to collaborate in real-time through shared task lists and direct inter-agent messaging. This represents a shift from orchestrated parallel execution to autonomous collaborative intelligence.

---

## What Are Agent Teams?

Agent teams consist of:

- **Team Lead**: Primary session that creates and coordinates the team
- **Teammates**: Independent Claude Code sessions with separate contexts
- **Shared Task List**: Centralized work queue stored in `~/.claude/tasks/{team-name}/`
- **Messaging System**: Direct agent-to-agent communication via mailbox
- **Team Configuration**: `~/.claude/teams/{team-name}/config.json`

Teams enable parallel work distribution with dynamic coordination, allowing agents to collaborate, challenge findings, and converge on solutions through autonomous decision-making.

---

## Architecture Comparison

| Pattern | Control Model | Communication | Best Use Case |
|---------|---------------|---------------|---------------|
| **Agent SDK** | Programmatic from external scripts | Via API calls | Batch processing, automation pipelines |
| **Multi-Agent Orchestration** | Sequential/parallel from main process | Through orchestrator | Structured workflows with dependencies |
| **Subagents** | Spawned by parent, report back only | Parent-child only | Quick research, focused verification |
| **Agent Teams** | Autonomous with shared state | Direct peer-to-peer + lead | Collaborative research, parallel analysis |

Key architectural difference: Teams allow horizontal communication between teammates without routing through the lead, enabling emergent collaboration patterns.

---

## When to Use Agent Teams

### Optimal Use Cases

- **Parallel research**: Multiple agents investigating independent aspects simultaneously
- **Competing hypotheses**: Different debugging theories explored concurrently with peer review
- **Multi-perspective code review**: Specialized reviewers (security, performance, testing) working in parallel
- **Cross-layer development**: Frontend, backend, database, QA each owned by separate teammate
- **Modular development**: New components built independently by different agents

### Anti-Patterns

- Sequential tasks with heavy inter-dependencies
- Same-file editing (causes merge conflicts)
- Simple tasks where coordination overhead exceeds benefit
- Budget-constrained environments (teams use 4-5x tokens)
- Workflows requiring strict ordering

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        TEAM LEAD                              │
│                  Main Claude Code Session                     │
│                                                                │
│  ┌───────────────────────────────────────────────────────┐    │
│  │            Shared Task List                           │    │
│  │  ~/.claude/tasks/{team-name}/                         │    │
│  │                                                        │    │
│  │  • Task 1: Security review (claimed: teammate_a)      │    │
│  │  • Task 2: Performance analysis (claimed: teammate_b) │    │
│  │  • Task 3: Test coverage (pending)                    │    │
│  │  • Task 4: API docs (blocked_by: Task 1)              │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Teammate A   │  │ Teammate B   │  │ Teammate C   │        │
│  │              │  │              │  │              │        │
│  │ Security     │←─┼─→ Messaging ←┼─→│ Testing      │        │
│  │ Specialist   │  │  System      │  │ Validator    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         ↕                                        ↕             │
│         └────────── Inter-Agent Mailbox ────────┘             │
└──────────────────────────────────────────────────────────────┘
```

### Components

**Team Lead**
- Creates team and spawns teammates
- Assigns tasks and coordinates work
- Synthesizes results from teammates
- Maintains overall project context

**Teammates**
- Independent Claude Code sessions
- Load project context (CLAUDE.md, MCP servers)
- Do NOT inherit lead's conversation history
- Auto-claim tasks from shared queue
- Message each other directly

**Task List**
- Shared state in filesystem
- Supports task dependencies (blocks/blockedBy)
- Auto-unblocks dependent tasks when prerequisites complete
- Tracks ownership and completion status

**Messaging System**
- Direct peer-to-peer communication
- Broadcast capability (lead to all teammates)
- Asynchronous mailbox-based delivery

---

## Configuration and Setup

### Enabling Agent Teams

Agent teams require experimental flag activation:

**Via settings.json** (`~/.claude/settings.json`):
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**Via environment variable**:
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

### Display Modes

**In-Process Mode** (default):
- All teammates run in main terminal
- Use **Shift+Up/Down** to cycle between agents
- Type to message selected teammate
- Works in any terminal emulator

**Split-Pane Mode**:
- Requires tmux or iTerm2
- Each teammate gets separate terminal pane
- Simultaneous output visibility
- Click pane to interact directly

Configure in settings.json:
```json
{
  "teammateMode": "split-pane"
}
```

Or override at runtime:
```bash
claude --teammate-mode in-process
```

---

## Team Coordination

### Spawning Teams

Create teams with explicit role definitions:

```
Create an agent team to analyze the authentication system:
- Security analyst: Review for vulnerabilities (use Opus for complex analysis)
- Performance engineer: Identify bottlenecks (use Sonnet)
- Test engineer: Validate coverage (use Haiku for faster iteration)

Have them coordinate on findings.
```

Claude as lead will:
1. Initialize team structure
2. Spawn 3 teammates with specified roles
3. Create shared task list
4. Distribute initial work

### Messaging Patterns

**Direct messaging**:
```
Tell the security analyst to prioritize authentication endpoints
```

**Broadcast** (use sparingly, high token cost):
```
Broadcast to all teammates: We're switching to OAuth2 flow
```

**Peer-to-peer**:
Teammates message each other autonomously based on work needs.

### Task Management

**Automatic claiming**:
Teammates auto-claim next available task when idle.

**Explicit assignment**:
```
Assign Task 3 to the performance engineer
```

**Dependencies**:
```
Task 4 is blocked by Task 1 and Task 2
```
System automatically unblocks Task 4 when both prerequisites complete.

### Delegate Mode

Prevent lead from executing work directly:

1. Start team
2. Press **Shift+Tab** to enter delegate mode
3. Lead coordinates only, teammates execute

Use when you want pure orchestration without lead contribution.

### Plan Approval Workflow

For high-risk changes:

```
Spawn a refactoring teammate to restructure the auth module.
Require plan approval before any code changes.
```

Flow:
1. Teammate analyzes and drafts plan
2. Submits to lead for review
3. Lead approves/rejects
4. If rejected, teammate revises and resubmits
5. Once approved, teammate executes

---

## Production Patterns

### Pattern 1: Multi-Perspective Code Review

**Setup**:
```
Review PR #142 with agent team. Spawn three specialized reviewers:
- Security: Authentication flows, input validation, injection vulnerabilities
- Performance: N+1 queries, caching, algorithmic complexity
- Testing: Edge case coverage, integration tests, mock quality

Each reviews independently and reports findings with severity ratings.
```

**Why effective**:
- Single reviewer exhibits focus bias toward familiar issue types
- Parallel specialized reviewers ensure comprehensive coverage
- No overlap or redundant analysis
- Clear ownership boundaries

**Output**: Consolidated report with findings grouped by category.

---

### Pattern 2: Competing Hypotheses Debugging

**Setup**:
```
Application crashes after first message instead of maintaining connection.

Spawn 5 debugging teammates to investigate competing hypotheses:
1. WebSocket connection termination
2. Memory leak triggering OOM
3. Event loop blocking
4. Uncaught error handler calling process.exit()
5. Timeout misconfiguration

Have them debate findings and challenge each other's theories.
Update findings.md with consensus and supporting evidence.
```

**Why effective**:
- Single agent anchors on first plausible theory (confirmation bias)
- Multiple competing hypotheses force rigorous evidence gathering
- Peer debate structure reveals flaws in reasoning
- Faster convergence to root cause

**Best practices**:
- Require evidence for all hypotheses
- Mandate peer challenges to prevent groupthink
- Synthesize consensus, not majority vote

---

### Pattern 3: Cross-Layer Feature Development

**Setup**:
```
Build user profile management feature with agent team:
- Frontend: React component, state management, form validation
- Backend: REST API endpoints, business logic, middleware
- Database: Schema migration, queries, indexes
- QA: Integration tests, E2E flows, edge cases

Each teammate owns their layer. Coordinate on interface contracts.
```

**Why effective**:
- No file conflicts (different layers = separate files)
- Clear ownership and accountability
- Interface-driven development forces communication
- Parallel development reduces critical path

**Coordination mechanism**: Define API contract first, then parallel implementation.

---

### Pattern 4: New Module Development

**Setup**:
```
Build notification system with four independent components:
- Email service teammate
- SMS service teammate
- Push notification teammate
- Notification scheduler teammate

Each builds their module independently, all implement common interface.
```

**Why effective**:
- Truly parallel work (no inter-dependencies)
- Interface compliance testable independently
- Reduces development time by ~4x

---

## Best Practices

### 1. Provide Explicit Context

Teammates load project configuration but NOT lead's conversation history. Include all relevant context in spawn prompt:

**Bad**:
```
Spawn security reviewer
```

**Good**:
```
Spawn security reviewer with prompt: "Review src/auth/ for vulnerabilities.
Application uses JWT tokens stored in httpOnly cookies with 24h expiration.
Focus on: token handling, session management, input validation, CSRF protection.
Report findings with severity (critical/high/medium/low) and code locations."
```

### 2. Task Sizing

- **Too small**: Coordination overhead exceeds benefit
- **Too large**: Teammates work too long without check-ins, risk divergence
- **Optimal**: Self-contained deliverable (module, test suite, review section)

**Rule of thumb**: 5-6 tasks per teammate maintains steady productivity.

### 3. Prevent File Conflicts

Multiple teammates editing same file leads to overwrites. Partition work by:
- Different files
- Different modules/packages
- Different architectural layers
- Different components

If same-file edits required: serialize tasks or use explicit merge coordination.

### 4. Monitor and Steer

Check progress regularly:
```
Status update from all teammates
```

Redirect approaches:
```
Tell performance engineer to focus on database query optimization,
not frontend rendering
```

Synthesize findings:
```
Collect all security findings into consolidated report
```

Don't let team run unattended for extended periods.

### 5. Quality Gates via Hooks

**.claude/hooks/TeammateIdle.sh**:
```bash
#!/bin/bash
# Runs when teammate finishes work and is about to go idle
# Exit 2 to send feedback and keep working
# Exit 0 to allow idle

if grep -q "TODO\|FIXME" "$TASK_OUTPUT"; then
  echo "ERROR: Implementation contains TODO comments. Please complete before marking done."
  exit 2
fi

if ! grep -q "test" "$TASK_FILES"; then
  echo "ERROR: No test files found. Add tests before completing task."
  exit 2
fi

exit 0
```

**.claude/hooks/TaskCompleted.sh**:
```bash
#!/bin/bash
# Runs when task marked complete
# Exit 2 to prevent completion
# Exit 0 to allow

# Enforce test coverage
if ! grep -q "\.test\.\|\.spec\." "$TASK_FILES"; then
  echo "ERROR: Task requires test coverage. Add test file before completing."
  exit 2
fi

# Run linter
if ! npm run lint --silent; then
  echo "ERROR: Linting failed. Fix issues before marking complete."
  exit 2
fi

exit 0
```

### 6. Graceful Shutdown

When work complete:
```
Request all teammates to shut down
```

Clean up team artifacts (MUST be done by lead):
```
Clean up the team
```

Never ask teammates to clean up team structure.

---

## Token Economics and Cost Optimization

### Cost Structure

Agent teams use significantly more tokens:

- **Base multiplier**: N teammates = N × token usage
- **Context duplication**: Each teammate loads full project context
- **Messaging overhead**: Inter-agent communication adds 10-20%
- **Coordination cost**: Task updates, status checks, synthesis

**Example**: 4-teammate team uses approximately 4.5-5× tokens of single session.

### When Cost Is Justified

- Complex research requiring multiple perspectives
- Parallel exploration reducing total wall-clock time
- Code review ensuring comprehensive coverage (prevents bugs)
- Debugging with competing theories (faster root cause identification)
- Critical path reduction in time-sensitive development

### When Cost Is Not Justified

- Routine CRUD operations
- Simple data transformations
- Sequential tasks with dependencies
- Budget-constrained environments
- Tasks completable by single agent in <30 minutes

### Cost Optimization Strategies

**Model selection**:
```
Spawn 3 teammates:
- Security analyst (Opus for complex reasoning)
- Performance engineer (Sonnet for balanced speed/quality)
- Test generator (Haiku for fast iteration)
```

**Right-sizing**:
- Don't spawn 10 teammates for 3 tasks
- Shutdown teammates immediately after work complete
- Use subagents instead for quick lookups

**Task batching**:
- Group related work into single task to reduce context switching
- Minimize messaging overhead with clear initial instructions

---

## Troubleshooting

### Teammates Not Appearing

**In-process mode**: Press **Shift+Down** to cycle through teammates.

**Split-pane mode**:
- Verify tmux installed: `which tmux`
- Verify iTerm2 if on macOS
- Check team creation succeeded: `ls ~/.claude/teams/`

**Insufficient task complexity**: If task too simple, Claude may not spawn team.

### Excessive Permission Prompts

Teammates inherit lead's permission mode. Pre-approve common operations in settings:

```json
{
  "permissions": {
    "read": "always",
    "write": "always",
    "execute": "confirm"
  }
}
```

### Lead Executing Instead of Delegating

Explicitly instruct:
```
Wait for teammates to complete their assigned tasks before proceeding
```

Or enter delegate mode: **Shift+Tab**

### File Conflicts

Two teammates modified same file concurrently. Prevention:
- Partition work by files
- Use explicit task dependencies
- Review task assignments before spawning

Resolution:
- Manually merge conflicts
- Assign rework to single teammate

### Orphaned tmux Sessions

List sessions:
```bash
tmux ls
```

Kill specific session:
```bash
tmux kill-session -t claude-team-{name}-{id}
```

Kill all orphaned sessions:
```bash
tmux kill-server
```

---

## Current Limitations

Agent teams are experimental. Known constraints:

- **No session resumption**: `/resume` does not restore in-process teammates
- **Single team per session**: Must clean up before creating new team
- **No nested teams**: Teammates cannot spawn their own sub-teams
- **Fixed lead**: Cannot promote teammate to lead mid-session
- **Split panes**: Requires tmux or iTerm2 (not VS Code, Windows Terminal, standard SSH)
- **No cross-machine teams**: All teammates run on same machine
- **Limited to Claude Code**: Cannot mix Claude Code with other agent frameworks

---

## Advanced Patterns

### Adversarial Review

```
Spawn two teams:
- Red team (3 agents): Find vulnerabilities, attempt exploits
- Blue team (3 agents): Defend, patch, verify fixes

Have them iterate until red team finds no new issues.
```

### Hierarchical Teams (Future)

```
Lead spawns 3 sub-leads:
- Frontend lead (spawns UI, UX, accessibility teammates)
- Backend lead (spawns API, DB, cache teammates)
- QA lead (spawns unit, integration, E2E teammates)

Sub-leads coordinate their teams, report to main lead.
```

Currently not supported, but architectural pattern for future capability.

### Competitive Implementation

```
Spawn 3 teammates to implement same feature with different approaches:
- Teammate A: Microservices architecture
- Teammate B: Monolith with modules
- Teammate C: Serverless functions

Compare implementations on performance, maintainability, cost.
```

---

## Integration Patterns

### CI/CD Pipeline Teams

```
On PR creation:
1. Spawn code review team (security, performance, tests)
2. Each teammate runs checks in parallel
3. Lead aggregates results
4. Auto-approve if all pass, block if any fail
```

Implementation requires CI/CD system integration with Claude Code API.

### Documentation Generation

```
Spawn documentation team:
- Analyzer: Extract API contracts, types, interfaces
- Writer: Generate documentation from analysis
- Reviewer: Check for completeness and accuracy
- Editor: Polish formatting and examples

Pipeline: analyze → write → review → edit → publish
```

### Monitoring and Incident Response

```
On production alert:
1. Detector teammate: Confirm issue, gather metrics
2. Diagnoser teammate: Identify root cause
3. Remediator teammate: Apply fix or rollback
4. Validator teammate: Verify resolution

Parallel execution reduces MTTR.
```

---

## Summary

Agent teams represent autonomous collaborative intelligence:

**Key capabilities**:
- Parallel work distribution with dynamic task claiming
- Direct peer-to-peer communication
- Competing hypotheses and adversarial review
- Cross-layer development with clear ownership

**Critical success factors**:
- Explicit context in spawn prompts
- Appropriate task sizing (self-contained deliverables)
- File conflict prevention through work partitioning
- Quality gates via hooks
- Cost optimization through model selection

**When to use**:
- Complex research requiring multiple perspectives
- Parallel analysis reducing critical path
- Multi-layer development with clear boundaries

**When to avoid**:
- Sequential tasks with dependencies
- Simple operations
- Budget constraints
- Same-file editing requirements

Agent teams are experimental but production-ready for appropriate use cases. Mastery requires understanding coordination patterns, token economics, and limitation workarounds.

---

**Phase Complete!** You've learned the most advanced coordination pattern in Claude Code: autonomous agent teams with emergent collaboration.
