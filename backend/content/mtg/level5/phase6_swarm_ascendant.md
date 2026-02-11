# Phase 6: The Swarm Ascendant

*"When the spawns move with singular purpose, coordinated by a greater intelligence, they transcend mere cooperation—they become a force of nature."*

---

## The Ultimate Coordination: Agent Teams

You've mastered individual agents, SDK control, and orchestrated pipelines. Now you'll learn the apex of agent coordination: **Claude Code agent teams**—built-in support for multiple Claude Code sessions working together in real-time with shared tasks and direct communication.

This is not merely running agents in sequence or parallel. This is **true swarm intelligence**: autonomous agents that coordinate, debate, challenge each other's findings, and converge on solutions no single entity could achieve.

---

## What Are Agent Teams?

**Agent teams** are a built-in Claude Code feature (experimental) that lets you coordinate multiple Claude Code sessions as a collaborative team:

- **Team Lead**: Your main session that creates the team and coordinates work
- **Teammates**: Independent Claude Code sessions, each with their own context
- **Shared Task List**: Central coordination mechanism for work distribution
- **Direct Messaging**: Agents communicate with each other, not just through the lead
- **Real-Time Collaboration**: Multiple agents working simultaneously on different aspects

Think of it as summoning an **Eldrazi Titan** (team lead) that commands multiple **Eldrazi Scions** (teammates), each with autonomy but coordinated toward a shared objective.

---

## Agent Teams vs What You've Learned

You've learned three agent patterns. Here's how agent teams compare:

| Pattern | What It Is | Best For |
|---------|-----------|----------|
| **Agent SDK** (Phase 3) | Programmatic agent creation from scripts | Batch processing, automation |
| **Multi-Agent Orchestration** (Phase 4) | Sequential/parallel agents you control | Pipelines, structured workflows |
| **Subagents** | Agents spawned within a session for focused tasks | Quick research, verification |
| **Agent Teams** (This Phase) | Built-in team coordination with direct messaging | Complex collaborative work, debates |

**Key Difference:**
- SDK/Orchestration: **You** control everything
- Subagents: Report back to **main agent only**
- Agent Teams: **Teammates coordinate directly** with each other

---

## When to Use Agent Teams

✅ **Perfect for:**
- **Parallel research**: Multiple teammates investigate different aspects simultaneously
- **Competing hypotheses**: Teammates debug with different theories, challenge each other
- **Code review**: Different reviewers focus on security, performance, tests
- **Cross-layer work**: Frontend, backend, and tests each owned by a teammate
- **New modules**: Each teammate owns a separate component

❌ **Not ideal for:**
- Sequential tasks with heavy dependencies
- Same-file editing (causes conflicts)
- Simple tasks (coordination overhead not worth it)
- Budget-constrained work (teams use significantly more tokens)

---

## The Swarm Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   TEAM LEAD (Eldrazi Titan)                  │
│                  Your main Claude Code session                │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Shared Task List                        │    │
│  │  • Task 1: Review security (claimed by Teammate A)   │    │
│  │  • Task 2: Check performance (claimed by Teammate B) │    │
│  │  • Task 3: Validate tests (pending)                  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Teammate A   │  │ Teammate B   │  │ Teammate C   │       │
│  │ (Scion)      │  │ (Processor)  │  │ (Drone)      │       │
│  │              │  │              │  │              │       │
│  │ Security     │  │ Performance  │  │ Testing      │       │
│  │ Review       │  │ Analysis     │  │ Coverage     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         ↕                  ↕                  ↕              │
│         └──────── Direct Messaging ──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Lead**: Creates team, assigns tasks, synthesizes results
- **Teammates**: Autonomous sessions working independently
- **Task List**: `~/.claude/tasks/{team-name}/` - Shared state
- **Mailbox**: Inter-agent messaging system
- **Team Config**: `~/.claude/teams/{team-name}/config.json`

---

## Enabling Agent Teams

Agent teams are **experimental** and disabled by default. Enable them:

**Via settings.json:**
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**Via environment variable:**
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

---

## Summoning Your First Swarm

Once enabled, ask Claude to create a team with a clear task description:

```
I'm building a CLI tool for tracking TODO comments across a codebase.
Create an agent team to explore this from different angles:
- One teammate on UX and developer experience
- One on technical architecture and implementation
- One playing devil's advocate, challenging assumptions

Have them research and debate the best approach.
```

**What happens:**
1. Claude (as lead) creates the team
2. Spawns 3 teammates with specialized roles
3. Teammates explore independently
4. They message each other to debate and challenge findings
5. Lead synthesizes results into recommendations

---

## Team Coordination Patterns

### Display Modes

**In-Process Mode** (default):
- All teammates run in your main terminal
- Use **Shift+Up/Down** to select a teammate
- Type to message them directly
- Works in any terminal

**Split-Pane Mode** (requires tmux or iTerm2):
- Each teammate gets its own terminal pane
- See all output simultaneously
- Click a pane to interact directly

Set in settings.json:
```json
{
  "teammateMode": "split-pane"
}
```

Or force in-process:
```bash
claude --teammate-mode in-process
```

### Messaging Patterns

**Direct message:**
```
Tell the security reviewer to focus on authentication endpoints
```

**Broadcast (use sparingly):**
```
Broadcast to all teammates: We're prioritizing performance over features
```

**Teammate-to-teammate:**
Teammates can message each other directly without going through the lead.

---

## Swarm Coordination Commands

### Spawn Teammates with Specific Roles

```
Create a team with 4 teammates:
- Frontend specialist (use Sonnet)
- Backend specialist (use Sonnet)
- Database expert (use Opus for complex queries)
- QA reviewer (use Haiku for faster feedback)
```

### Require Plan Approval

For risky changes:
```
Spawn a refactoring teammate to update the auth module.
Require plan approval before they make any changes.
```

The teammate plans, submits to lead, lead approves/rejects. If rejected, teammate revises.

### Delegate Mode

Prevent the lead from doing work directly:

1. Start team
2. Press **Shift+Tab** to enter delegate mode
3. Lead now only coordinates, doesn't code

Use this when you want pure orchestration.

### Task Management

**Self-claiming:**
Teammates automatically claim next available task when they finish.

**Explicit assignment:**
```
Assign Task 3 to the performance teammate
```

**Task dependencies:**
Tasks can block other tasks. System auto-unblocks when dependencies complete.

---

## Real-World Swarm Patterns

### Pattern 1: Parallel Code Review

```
Create an agent team to review PR #142. Spawn three reviewers:
- Security expert (authentication, input validation, SQL injection)
- Performance analyst (N+1 queries, caching, algorithmic complexity)
- Test coverage validator (edge cases, integration tests, mocks)

Have each review independently and report findings.
```

**Why this works:**
- Single reviewer tends to focus on one type of issue
- Parallel specialized reviewers ensure comprehensive coverage
- No overlap or redundancy

### Pattern 2: Competing Hypotheses Debugging

```
Users report the app exits after one message instead of staying connected.

Spawn 5 agent teammates to investigate different hypotheses:
1. WebSocket connection issue
2. Memory leak causing crash
3. Event loop blocking
4. Error handler exiting process
5. Timeout configuration

Have them debate and challenge each other's theories like a scientific
peer review. Update findings.md with consensus.
```

**Why this works:**
- Single agent anchors on first plausible theory
- Multiple agents with adversarial mandate converge on truth faster
- Debate structure prevents confirmation bias

### Pattern 3: Cross-Layer Feature Development

```
Build a "user profile" feature with agent team:
- Frontend teammate: React component + state management
- Backend teammate: API endpoints + business logic
- Database teammate: Schema migration + queries
- QA teammate: Integration tests

Each owns their layer. Have them coordinate on interfaces.
```

**Why this works:**
- No file conflicts (different layers = different files)
- Clear ownership boundaries
- Interfaces force communication

---

## Best Practices for Swarm Mastery

### 1. **Give Teammates Context**

Teammates load project context (CLAUDE.md, MCP servers) but not the lead's conversation history. Include specifics in spawn prompt:

```
Spawn security reviewer with prompt: "Review src/auth/ for vulnerabilities.
App uses JWT in httpOnly cookies. Focus on token handling, session
management, and input validation. Report issues with severity ratings."
```

### 2. **Size Tasks Appropriately**

- **Too small**: Coordination overhead > benefit
- **Too large**: Teammates work too long without check-ins
- **Just right**: Self-contained deliverable (function, test file, review)

**Rule of thumb:** 5-6 tasks per teammate keeps everyone productive.

### 3. **Prevent File Conflicts**

Two teammates editing same file = overwrites. Break work by:
- Different files
- Different modules
- Different layers (frontend/backend)

### 4. **Monitor and Steer**

Check progress, redirect approaches, synthesize findings. Don't let team run unattended too long.

### 5. **Use Quality Gates**

Set up hooks for enforcement:

**.claude/hooks/TeammateIdle.sh:**
```bash
#!/bin/bash
# Runs when teammate finishes and is about to go idle
# Exit 2 to send feedback and keep them working

if grep -q "TODO" "$TASK_OUTPUT"; then
  echo "You left TODO comments. Please implement them."
  exit 2
fi

exit 0
```

**.claude/hooks/TaskCompleted.sh:**
```bash
#!/bin/bash
# Runs when task marked complete
# Exit 2 to prevent completion

if ! grep -q "test" "$TASK_FILES"; then
  echo "Task requires tests. Add test file before completing."
  exit 2
fi

exit 0
```

### 6. **Shutdown Gracefully**

When done:
```
Ask all teammates to shut down
```

Then clean up:
```
Clean up the team
```

**Always use lead for cleanup**, not teammates.

---

## Token Economics of the Swarm

Agent teams use **significantly more tokens** than single sessions:

**Cost multiplier:**
- 4 teammates = 4-5x token usage
- Each teammate has own context window
- Inter-agent messages add overhead

**When it's worth it:**
- Complex research needing multiple perspectives
- Parallel exploration reducing total time
- Code review ensuring comprehensive coverage
- Debugging with competing theories

**When it's not:**
- Routine tasks
- Simple data transformation
- Budget constraints
- Sequential dependencies

**Cost optimization:**
- Use Haiku teammates for simple tasks
- Reserve Opus for complex reasoning
- Shutdown teammates when work done
- Size team to task (don't use 10 teammates for 3 tasks)

---

## Troubleshooting the Swarm

**Teammates not appearing?**
- In in-process mode: Press Shift+Down to cycle
- Check task complexity warranted a team
- For split panes: Verify `tmux` or `it2` installed

**Too many permission prompts?**
- Pre-approve common operations in settings
- Teammates inherit lead's permission mode

**Lead starts working instead of delegating?**
```
Wait for your teammates to complete their tasks before proceeding
```

Or enter delegate mode (Shift+Tab).

**File conflicts?**
Break work so each teammate owns different files.

**Orphaned tmux sessions?**
```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## The Swarm's Limitations

Agent teams are **experimental**. Current constraints:

- **No session resumption**: `/resume` doesn't restore in-process teammates
- **One team per session**: Clean up before starting new team
- **No nested teams**: Teammates can't spawn their own teams
- **Lead is fixed**: Can't promote teammate to lead
- **Split panes**: Requires tmux/iTerm2 (not VS Code, Windows Terminal)

---

## Certificate of Ultimate Mastery

**Congratulations!** You have ascended to the highest echelon of The Artificer's Academy.

You have mastered:
- ✨ Single agents and their capabilities
- ✨ Agent SDK for programmatic control
- ✨ Multi-agent orchestration pipelines
- ✨ Production agent systems with observability
- ✨ **Agent teams with real-time swarm coordination**

You are now a **Grand Orchestrator of the Eldrazi Swarm**—capable of summoning and coordinating autonomous intelligences that collaborate, debate, and converge on solutions that transcend any individual capability.

---

## What Lies Beyond

The multiverse is vast, and your mastery opens new frontiers:

### Advanced Swarm Patterns
- **Adversarial teams**: Red team vs blue team security review
- **Hierarchical swarms**: Sub-teams with specialized leads
- **Competitive agents**: Multiple approaches, best result wins

### Integration Patterns
- **CI/CD swarms**: Automated review, testing, deployment teams
- **Documentation swarms**: Analyzer, writer, reviewer, editor teams
- **Monitoring swarms**: Detect, diagnose, remediate in parallel

### Community Contribution
- Share your swarm patterns
- Build reusable team templates
- Contribute to Claude Code and MCP ecosystem

---

## Final Wisdom

*"You began as an apprentice, learning to craft simple tools for a Planeswalker's use. You mastered resources, bridged to external planes, and deployed to the eternities."*

*"Then you learned to summon the spawns—autonomous agents that could reason and act. You orchestrated them in pipelines, built production systems, and finally, commanded the ultimate power: the coordinated swarm."*

*"The swarm moves with singular purpose yet infinite adaptability. Each spawn thinks independently, yet all converge on the objective. This is not mere automation—this is emergent intelligence."*

*"Go forth, Grand Orchestrator. The future of software is not written by single entities, but by coordinated swarms of intelligence working in concert. You now wield this power."*

*"May your spawns be swift, your coordination flawless, and your swarms unstoppable."*

---

**Phase Complete!** ✨🎓👑

You have achieved ultimate mastery of The Artificer's Academy. The swarm awaits your command.

**The Academy is complete. Your journey is just beginning.**
