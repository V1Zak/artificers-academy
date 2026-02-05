# The Artificer's Academy

An interactive educational platform that teaches developers how to build, debug, and deploy **Model Context Protocol (MCP)** servers through the lens of Magic: The Gathering metaphors.

## Live Demo

- **Frontend:** https://artificers-academy.vercel.app
- **Backend API:** https://artificers-academy-production.up.railway.app

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
- **Authentication**: Secure login with Supabase Auth

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS | 14.x |
| Backend | FastAPI (Python), uv package manager | 3.12+ |
| Database | Supabase (PostgreSQL + Auth) | - |
| Auth | @supabase/ssr | 0.8.0+ |
| Deployment | Vercel (frontend), Railway (backend) | - |

## Project Structure

```
artificers-academy/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── (auth)/      # Login/signup pages
│   │   │   ├── (dashboard)/ # Protected dashboard pages
│   │   │   └── api/         # API routes
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities & API client
│   │       └── supabase/    # Supabase client configs
│   └── package.json
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── models/          # Pydantic schemas
│   ├── content/             # Curriculum markdown files
│   └── pyproject.toml
│
├── supabase/                 # Database setup
│   └── README.md            # Supabase configuration guide
│
├── CLAUDE.md                 # AI assistant rules & project context
└── DEPLOYMENT.md            # Production deployment guide
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager
- Supabase account

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies with uv
uv sync

# Create .env file with Supabase credentials
cat > .env << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ENVIRONMENT=development
EOF

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

# Create environment file
cp .env.example .env.local

# Edit .env.local with your credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Database Setup

See [supabase/README.md](supabase/README.md) for detailed database setup instructions.

**Required Tables:**
- `user_progress` - Tracks user journey through levels
- `code_snippets` - Stores saved code (Decklists)

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

### Health Check
```
GET /health
```
Returns service status and database connection state.

### Curriculum
```
GET /api/curriculum          # Get all levels
GET /api/levels/{level_id}   # Get specific level
GET /api/levels/{level_id}/phases/{phase_id}  # Get phase content
```

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
GET  /api/progress/{user_id}   # Get user progress
POST /api/progress/{user_id}   # Save progress
```

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

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

**Quick Links:**
- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app/dashboard
- Supabase Dashboard: https://supabase.com/dashboard

## Troubleshooting

### Auth Issues
- Ensure `@supabase/ssr` is version 0.8.0+ (older versions have cookie handling bugs)
- Check that Supabase Site URL matches your deployment URL
- Verify redirect URLs are configured in Supabase Auth settings

### Database Errors
- Run the migration scripts in `supabase/` directory
- Ensure `user_progress` table has the unique constraint on `(user_id, level_id, phase_id)`

### CORS Errors
- Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Ensure no trailing slash in URLs

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
