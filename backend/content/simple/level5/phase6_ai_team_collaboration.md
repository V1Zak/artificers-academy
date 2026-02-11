# Phase 6: Working with AI Helper Teams

*"When multiple helpers work together with a shared goal, they can solve problems that would be too hard for just one."*

---

## What Are AI Helper Teams?

So far in this course, you've learned how to work with AI helpers one at a time. Now you'll learn about **AI helper teams** - a way to have multiple AI helpers working together at the same time, talking to each other, and helping each other solve problems.

Think of it like this:
- **Before**: You had one smart assistant helping you
- **Now**: You have a whole team of smart assistants, each focusing on different things, but all working toward the same goal

This is different from just running helpers one after another. These helpers can actually **talk to each other** and **work at the same time**.

---

## How Is This Different From What We Learned Before?

Let's compare the different ways you've learned to use AI helpers:

| What You Learned | How It Works | When to Use It |
|-----------------|--------------|----------------|
| **SDK Control** (Phase 3) | You write code to control when helpers start and stop | When you want to automate things with code |
| **Multiple Helpers in Order** (Phase 4) | Helpers work one after another, like an assembly line | When one task must finish before the next starts |
| **AI Helper Teams** (This Phase) | Multiple helpers work at the same time and talk to each other | When you need different experts looking at the same problem |

**The Big Difference:**
- With SDK and ordered helpers: **You** tell each helper exactly what to do
- With teams: **The helpers coordinate with each other** and make decisions together

---

## When Should You Use Teams of AI Helpers?

**Good situations for teams:**
- When you want different perspectives on the same problem
- When you have separate tasks that can happen at the same time
- When you want to review code from different angles (security, speed, tests)
- When you're trying to find a bug and want to test different theories
- When you're building something with separate parts (like a website's look and its back-end code)

**Not so good for teams:**
- Simple tasks that one helper can do easily
- Tasks that must happen in order (step 1, then step 2, then step 3)
- When multiple helpers would need to edit the same file (they might overwrite each other)
- When you're watching your budget (teams cost more because each helper uses resources)

---

## How to Turn On This Feature

AI helper teams are still **experimental**. This means they're new and still being improved. You need to turn them on first.

**Two ways to enable teams:**

**Option 1: In your settings file**

Find your settings file and add this:
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**Option 2: In your terminal**

Before starting Claude Code, type:
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

---

## Starting Your First Team

Once you've turned on teams, here's how to start one. Just talk to Claude Code normally and explain what you want the team to do:

```
I'm working on a new feature for my app. Can you create a team to help?

I need:
- One helper to focus on making it easy to use
- One helper to think about how to build it technically
- One helper to challenge our ideas and find problems

Have them research and discuss the best way to do this.
```

**What happens next:**

1. Claude Code (acting as the **team lead**) creates the team
2. It starts 3 separate helpers (called **teammates**)
3. Each teammate works on their part
4. The teammates send messages to each other to share ideas and debate
5. The team lead collects everyone's work and gives you a summary

You don't need to manage each helper yourself - they work together automatically!

---

## Understanding Team Roles

When you create a team, there are different roles:

- **Team Lead**: This is your main Claude Code session. It creates the team, gives out tasks, and collects the results
- **Teammates**: These are separate AI helpers, each with their own focus and specialty
- **Shared Task List**: A to-do list that everyone on the team can see and work from
- **Mailbox**: A messaging system so teammates can talk to each other

Think of it like a group project at school:
- The team lead is like the project coordinator
- Teammates are like different group members with different skills
- The task list is like your shared checklist
- The mailbox is like your group chat

---

## Two Ways to See Your Team

There are two ways to watch your team work:

### Option 1: All in One Window (Default)

All teammates show their work in your main window. To talk to a specific teammate:
- Press **Shift+Up** or **Shift+Down** to select which teammate you want to talk to
- Type your message
- This works in any terminal program

### Option 2: Split Windows (Advanced)

Each teammate gets their own window, so you can see everyone working at once. This requires special terminal software (tmux or iTerm2 on Mac).

To turn this on, add to your settings:
```json
{
  "teammateMode": "split-pane"
}
```

**Tip for beginners:** Start with Option 1 (all in one window). It's simpler and works everywhere.

---

## Talking to Your Team

Once your team is working, you can give them instructions:

**Talk to one specific teammate:**
```
Tell the security reviewer to focus on the login page
```

**Talk to everyone at once (use sparingly):**
```
Broadcast to all teammates: We need to finish by Friday
```

**Let teammates talk to each other:**
The cool thing about teams is that teammates can message each other directly! You don't have to pass every message yourself.

---

## Real Example 1: Team Code Review

Let's say you wrote some code and want it reviewed. Instead of having one AI look at everything, you could do this:

```
Create a team to review my new user registration code. I need three reviewers:

1. Security expert: Check if the code is safe from hackers
2. Speed expert: Check if the code runs fast enough
3. Testing expert: Check if we have good tests

Have each reviewer look at different things and report what they find.
```

**Why this works well:**
- One reviewer might miss things because they focus on their favorite topic
- Three specialized reviewers make sure nothing gets missed
- Each reviewer can focus deeply on their area

**What you'll get:**
- Security review: "Found 2 issues - passwords should be hashed better"
- Speed review: "Code looks good, but we should add caching"
- Testing review: "We're missing tests for the error cases"

---

## Real Example 2: Debugging with Different Theories

Imagine users are reporting a bug, but you're not sure what's causing it. You could use a team to test different ideas:

```
Users say the app closes after they send one message instead of staying open.

Create a team of 5 helpers to investigate different possible causes:
1. Check if it's a connection problem
2. Check if the app is running out of memory
3. Check if something is blocking the program
4. Check if an error is closing the app
5. Check if there's a timeout setting

Have them discuss their findings and figure out what's really wrong.
```

**Why this works well:**
- If you only test one theory, you might waste time if it's wrong
- Multiple helpers testing different theories find the answer faster
- Having them debate prevents them from jumping to conclusions too quickly

**What you'll get:**
- Five different investigations happening at once
- Teammates sharing findings: "I found something in the error logs that might be related to what you found"
- A final answer based on what the evidence really shows, not just guesses

---

## Tips for Success with Teams

### 1. Give Each Teammate Clear Instructions

When you create teammates, tell them exactly what you want them to focus on:

**Good example:**
```
Create a security reviewer. Have them check the login code for:
- Are passwords being stored safely?
- Can hackers steal user data?
- Are we checking user input properly?
Report problems with how serious each one is.
```

**Not as good:**
```
Create a reviewer to check the code.
```

### 2. Make Tasks the Right Size

- **Too small**: "Check line 5 of this file" - Not worth making a whole teammate for this
- **Too big**: "Rewrite the entire app" - Too much for one teammate to handle
- **Just right**: "Review the authentication code" - A complete piece of work

**Good rule:** If a task would take you 15-30 minutes, it's probably a good size for a teammate.

### 3. Avoid File Conflicts

If two teammates try to edit the same file at the same time, they might overwrite each other's work. Prevent this by:
- Having teammates work on different files
- Having teammates work on different parts of the project (one on frontend, one on backend)
- Having teammates do different types of work (one reviews, one writes tests, one writes docs)

### 4. Check In on Your Team

Don't just start a team and walk away! Check on them regularly:
- See what they've found
- Give new directions if needed
- Help if teammates disagree on something
- Collect the results when they're done

### 5. Shut Down When Done

When your team finishes their work, shut them down properly:

```
Ask all teammates to shut down
```

Then clean up:
```
Clean up the team
```

This stops the teammates and saves your resources.

---

## What Does It Cost?

Here's something important to know: **Teams cost more than single helpers**.

Why? Because each teammate is like running a separate Claude Code session. They each use resources (called "tokens").

**Cost example:**
- 1 helper = 1x cost
- 4 helpers = 4-5x cost

**When it's worth the extra cost:**
- Complex problems that need different viewpoints
- Finding bugs faster by testing multiple theories
- Making sure code reviews don't miss anything important
- Saving your time by having things happen in parallel

**When it might not be worth it:**
- Simple tasks one helper could do
- If you're on a tight budget
- Tasks that have to happen in order anyway

**Saving money:**
- Only create as many teammates as you need (don't make 10 teammates for 3 tasks)
- Shut down teammates when their work is done
- For simple tasks, use the faster, cheaper AI model (Haiku) for teammates
- Save the expensive model (Opus) for the really hard thinking

---

## Common Problems and How to Fix Them

### Problem: "I don't see my teammates"

**Solution:**
- If you're using "all in one window" mode: Press Shift+Down to cycle through teammates
- Make sure you actually turned on the teams feature (see "How to Turn On This Feature" section)
- For split windows: Make sure you have tmux or iTerm2 installed

### Problem: "The team lead is doing all the work instead of the teammates"

**Solution:**
Tell the team lead to wait:
```
Wait for your teammates to complete their tasks before doing anything yourself
```

Or try pressing **Shift+Tab** to enter "delegate mode" - this makes the lead only coordinate, not do work.

### Problem: "My teammates keep overwriting each other's work"

**Solution:**
Make sure each teammate works on different files. Plan your tasks so there's no overlap:
- Teammate A works on file1.js
- Teammate B works on file2.js
- Teammate C writes tests in test.js

### Problem: "I keep getting asked for permission for everything"

**Solution:**
You can pre-approve certain actions in your settings so you're not interrupted constantly. Teammates inherit the same permission settings as your team lead.

### Problem: "I have leftover terminal windows that won't close"

**Solution:**
If you're using split-pane mode, sometimes terminal sessions stick around. Clean them up:
```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## What Teams Can't Do (Yet)

Remember, teams are experimental! Here are current limitations:

- **Can't resume**: If you close Claude Code, you can't bring back your team later
- **One team at a time**: Finish one team before starting another
- **No nested teams**: Teammates can't create their own sub-teams
- **Team lead stays lead**: You can't promote a teammate to be the new leader
- **Split windows**: Only works with specific terminal programs

These limitations might change as the feature gets better!

---

## You Did It!

**Congratulations!** You've completed the entire Artificer's Academy!

You've learned:
- ✅ What AI helpers are and how to use them
- ✅ How to start and control helpers from code
- ✅ How to run multiple helpers in order or at the same time
- ✅ How to use helpers in real production systems
- ✅ **How to create teams of helpers that work together**

You now know how to use AI helpers in powerful ways:
- One helper for simple tasks
- Multiple helpers in sequence for workflows
- Teams of helpers for complex collaborative work

This is a valuable skill! The future of software development involves working with AI helpers, and you now know how to do that effectively.

---

## What's Next?

Now that you've mastered the basics, here are some ideas for what to explore:

### Try These Team Patterns
- **Red team vs blue team**: One team tries to hack your code, another team defends it
- **Multiple approaches**: Have teammates try different solutions, pick the best one
- **Documentation team**: One helper analyzes code, one writes docs, one reviews them

### Use Teams in Your Real Projects
- **Code reviews**: Get comprehensive reviews from specialized reviewers
- **Bug hunting**: Test different theories when debugging
- **Building features**: Split work across frontend, backend, and testing

### Share What You Learn
- Tell other developers about what you've learned
- Share your team patterns that work well
- Help improve Claude Code and MCP by giving feedback

---

## Final Thoughts

You started this course as a beginner, learning what AI helpers are and how to use them. Now you can:
- Work with single helpers efficiently
- Control helpers with code
- Orchestrate multiple helpers
- Deploy helpers to production
- **Coordinate entire teams of helpers**

This is powerful knowledge. AI helpers can:
- Work 24/7
- Never get tired
- Follow instructions precisely
- Handle multiple tasks at once when working in teams

But they work best when guided by someone who understands them - someone like **you**!

Remember: AI helpers are tools. You're the one who decides what to build, how to build it, and whether the results are good. Your judgment, creativity, and problem-solving skills are what make the difference.

**Go build amazing things!** You have the knowledge. You have the tools. Now it's time to use them.

---

**Phase Complete!** 🎓

You've finished The Artificer's Academy. Your journey as an AI helper coordinator has just begun!

**Keep learning, keep building, and keep exploring!**
