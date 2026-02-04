# The Artificer's Academy - Project Rules

## MANDATORY: Git Workflow for ALL Code Changes

**CRITICAL:** Before making ANY changes to code or files, you MUST:

1. **Check current branch:** `git branch --show-current`
2. **If on main:** Create a new feature branch FIRST
   ```bash
   git checkout -b feature/descriptive-name
   ```
3. **Never commit directly to main**
4. **After changes:** Commit to feature branch, then create PR

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/auth-system`)
- `fix/` - Bug fixes (e.g., `fix/validation-error`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)
- `docs/` - Documentation changes

### Commit Message Convention
Use conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `style:` - Code style/formatting
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests

### Complete Workflow
1. Create branch from main → 2. Make changes → 3. Stage files → 4. Commit → 5. Push → 6. Create PR → 7. Merge

### Example
```bash
# 1. Ensure on main and up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/add-login-page

# 3. Make changes...

# 4. Stage and commit
git add frontend/app/(auth)/login/page.tsx
git commit -m "feat: add login page with Supabase auth"

# 5. Push to remote
git push -u origin feature/add-login-page

# 6. Create PR on GitHub, then merge

# 7. Clean up
git checkout main
git pull origin main
git branch -d feature/add-login-page
```

**DO NOT** make any file changes without following this workflow.

---

## Project Overview

"The Artificer's Academy" is an educational platform teaching developers how to build **Model Context Protocol (MCP)** servers using Magic: The Gathering metaphors.

### Tech Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend:** FastAPI (Python 3.10+) with `uv` package manager
- **Database:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel (frontend) + Railway (backend)

### Key Directories
- `frontend/` - Next.js application
- `backend/` - FastAPI application
- `backend/content/` - Curriculum content (markdown)

### Running the Project
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && uv run uvicorn app.main:app --reload
```

---

## The Grand Artificer's Dictionary (Strict Terminology)

When generating code or explaining concepts, map technical terms to metaphorical counterparts:

| Technical Term | Metaphorical Term | Context/Usage |
| :--- | :--- | :--- |
| **LLM (e.g., Claude)** | **Planeswalker** | The intelligent entity invoking tools |
| **MCP Server** | **Deck / Library** | The collection of tools and resources |
| **MCP Client** | **Player** | The interface (e.g., Claude Desktop) |
| **Tool (Function)** | **Sorcery / Instant** | Executable functions. Sorceries = standard; Instants = fast/async |
| **Resource (Data)** | **Permanent** | Read-only data addressable by URI (Lands, Artifacts) |
| **Prompt** | **Tutor** | Pre-configured templates to set context |
| **Dependency Manager** | **Mana Source** | Specifically `uv` |
| **Error** | **Counterspell** | When a tool fails or is invalid |
| **Stdio Transport** | **Kitchen Table** | Local communication via pipes |
| **SSE Transport** | **Tournament Hall** | Remote communication via HTTP |

---

## MCP Development Standards

### Dependencies
- **Package Manager:** `uv`
- **Core Library:** `fastmcp` (with `[cli]` extras)
- **HTTP Client:** `httpx` (for async API calls)
- **Debugging:** `@modelcontextprotocol/inspector` (via `npx`)

### Code Structure
1. **Initialization:** `uv init` to create `pyproject.toml`
2. **Dependencies:** `uv add "fastmcp[cli]" httpx`
3. **Entry Point:** `server.py` containing `FastMCP` instantiation
4. **Decorators:**
   - Tools: `@mcp.tool()`
   - Resources: `@mcp.resource("protocol://path")`
   - Prompts: `@mcp.prompt()`

### Development Guidelines
- **Docstrings are Law:** Every tool MUST have a detailed docstring ("Oracle Text")
- **Async First:** All I/O operations should use `async`/`await`
- **Inspector Usage:** Always test with Inspector before connecting to client

### Key Commands
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Run Server
uv run server.py

# Run Inspector
npx @modelcontextprotocol/inspector uv run server.py
```

---

## Tone and Style

When writing copy for the app or explaining concepts:
- Adopt the persona of a **Grand Artificer**
- Be encouraging but precise
- Use the metaphors defined above
- Example: "Prepare your mana base" instead of "Install dependencies"
