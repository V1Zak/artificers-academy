"""
Progress Router - The Chronicle of Journeys

Endpoints for tracking user progress through the curriculum.
"""

from fastapi import APIRouter, Depends

from app.models.schemas import (
    ProgressUpdate,
    ProgressResponse,
    ProgressUpdateResponse,
)
from app.services.database import DatabaseService, get_database

router = APIRouter()


@router.get("/progress/{user_id}", response_model=ProgressResponse)
async def get_progress(
    user_id: str,
    db: DatabaseService = Depends(get_database),
) -> ProgressResponse:
    """
    Retrieve a Planeswalker's journey progress.

    Returns all completed phases and current position in the curriculum.
    """
    progress = await db.get_progress(user_id)
    return ProgressResponse(user_id=user_id, progress=progress)


@router.post("/progress/{user_id}", response_model=ProgressUpdateResponse)
async def update_progress(
    user_id: str,
    update: ProgressUpdate,
    db: DatabaseService = Depends(get_database),
) -> ProgressUpdateResponse:
    """
    Record a Planeswalker's progress through a phase.

    Call this when a user completes a phase or wants to save their code.
    """
    await db.upsert_progress(
        user_id=user_id,
        level_id=update.level_id,
        phase_id=update.phase_id,
        completed=update.completed,
        code_snapshot=update.code_snapshot,
    )

    return ProgressUpdateResponse(
        status="success",
        message="Progress recorded in the Chronicle"
    )
