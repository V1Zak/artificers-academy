"""
The Artificer's Academy - Backend API

The Oracle Engine that validates Decklists (MCP servers) and tracks
Planeswalker progress through their journey.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import validation, progress, snippets, content
from app.services.database import get_database
from app.config import get_settings

app = FastAPI(
    title="The Artificer's Academy API",
    description="Backend API for the MCP learning platform",
    version="0.1.0",
)

# Configure CORS for frontend communication
def get_cors_origins() -> list[str]:
    """Build list of allowed CORS origins."""
    settings = get_settings()
    origins = [
        "http://localhost:3000",  # Next.js dev server
    ]

    # Add production frontend URL if configured
    if settings.frontend_url:
        origins.append(settings.frontend_url)

        # Also allow Vercel preview deployments for the same project
        # Extract project name from production URL for preview pattern
        # e.g., https://myapp.vercel.app -> also allow https://myapp-*-username.vercel.app
        if "vercel.app" in settings.frontend_url:
            origins.append(settings.frontend_url.replace("https://", "https://*-"))

    return origins


def get_cors_regex() -> str | None:
    """Get CORS origin regex pattern for preview deployments."""
    settings = get_settings()

    # Only allow Vercel preview URLs if a Vercel production URL is configured
    # This prevents allowing ANY Vercel app when FRONTEND_URL isn't set
    if settings.frontend_url and "vercel.app" in settings.frontend_url:
        # Extract the app name prefix for matching preview deployments
        # Production: https://myapp.vercel.app
        # Previews:   https://myapp-git-branch-user.vercel.app
        app_name = settings.frontend_url.replace("https://", "").replace(".vercel.app", "")
        return rf"https://{app_name}(-[a-z0-9-]+)?\.vercel\.app"

    return None


cors_origins = get_cors_origins()
cors_regex = get_cors_regex()

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(validation.router, prefix="/api", tags=["validation"])
app.include_router(progress.router, prefix="/api", tags=["progress"])
app.include_router(snippets.router, prefix="/api", tags=["snippets"])
app.include_router(content.router, prefix="/api", tags=["content"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Welcome to The Artificer's Academy",
        "status": "The mana flows steadily",
    }


@app.get("/health")
async def health_check():
    """Health check for deployment monitoring."""
    settings = get_settings()
    db = get_database()

    return {
        "status": "healthy",
        "database": "connected" if db.is_connected else "in-memory",
        "environment": settings.environment,
    }
