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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Vercel deployments
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
