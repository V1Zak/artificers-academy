# The Artificer's Academy

An interactive educational platform that teaches developers how to build, debug, and deploy **Model Context Protocol (MCP)** servers through the lens of Magic: The Gathering metaphors.

## Overview

The Artificer's Academy transforms complex MCP concepts into an engaging learning experience by treating:
- **MCP Servers** as **Decks/Libraries**
- **Tools** as **Sorceries** (executable spells)
- **Resources** as **Permanents** (persistent data)
- **The LLM (Claude)** as the **Planeswalker** invoking your spells

## Features

- **Progressive Curriculum**: Four levels taking you from basics to deployment
- **The Inspector**: Real-time code validation with themed feedback
- **The Codex**: Comprehensive documentation with the Grand Artificer's Dictionary
- **Progress Tracking**: Save your journey and code snippets

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.10+), uv package manager |
| Database | Supabase (PostgreSQL + Auth) |
| Deployment | Vercel (frontend), Railway (backend) |

## Project Structure

```
artificers-academy/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities & API client
│   └── package.json
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── models/          # Pydantic schemas
│   └── pyproject.toml
│
└── CLAUDE.md                 # AI assistant rules & project context
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- [uv](https://github.com/astral-sh/uv) package manager
- Supabase account (for auth)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies with uv
uv sync

# Run the development server
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# NEXT_PUBLIC_SUPABASE_URL=your-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`

## The Curriculum

### Level 1: The Sanctum (MTG Oracle)
Learn MCP fundamentals by building a Magic: The Gathering card oracle server.
- Understanding Clients, Hosts, and Servers
- Creating your first `@mcp.tool()`
- Writing Oracle Text (docstrings)
- Testing with the Inspector

### Level 2: The Archive (Filesystem)
Master local file operations with read/write access.
- Resources as Permanents
- Handling errors (Counterspells)
- Security considerations

### Level 3: The Aether (External APIs)
Connect to the outside world with async operations.
- Dynamic Resources
- Async/await patterns
- Prompts as Tutors

### Level 4: The Blind Eternities (Deployment)
Deploy your server to production.
- Transport layers (stdio vs SSE)
- Docker containerization
- Production best practices

## The Grand Artificer's Dictionary

| Technical Term | Metaphor | Description |
|---------------|----------|-------------|
| LLM (Claude) | Planeswalker | The intelligent entity invoking tools |
| MCP Server | Deck/Library | Collection of tools and resources |
| MCP Client | Player | The interface (Claude Desktop, etc.) |
| Tool | Sorcery/Instant | Executable functions |
| Resource | Permanent | Read-only data addressable by URI |
| Prompt | Tutor | Pre-configured context templates |
| uv | Mana Source | The package manager |
| Error | Counterspell | When a spell fails |
| stdio | Kitchen Table | Local transport |
| SSE | Tournament Hall | Remote transport |

## API Endpoints

### Validation
```
POST /api/validate
Content-Type: application/json

{
  "code": "from fastmcp import FastMCP..."
}
```

Returns validation results with themed error messages.

### Progress
```
GET  /api/progress/{user_id}
POST /api/progress/{user_id}
```

Track and update user progress through levels.

## Development

### Git Workflow

This project enforces a strict branch-based workflow:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push and create PR: `git push -u origin feature/your-feature`
4. Merge via GitHub PR

**Commit Convention:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance

### Running Tests

```bash
# Backend
cd backend && uv run pytest

# Frontend
cd frontend && npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes following the commit convention
4. Push to your branch
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic
- [FastMCP](https://github.com/jlowin/fastmcp) for the Python MCP framework
- Magic: The Gathering for the inspiration (Wizards of the Coast)

---

*"Prepare your mana base, Artificer. Your journey begins here."*
