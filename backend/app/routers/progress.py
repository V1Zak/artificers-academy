"""
Progress Router - The Chronicle of Journeys

Endpoints for tracking user progress through the curriculum.
"""

from fastapi import APIRouter

from app.models.schemas import (
    ProgressEntry,
    ProgressUpdate,
    ProgressResponse,
    ProgressUpdateResponse,
)

router = APIRouter()

# Temporary in-memory storage (will be replaced with Supabase)
_progress_store: dict[str, list[ProgressEntry]] = {}


@router.get("/progress/{user_id}", response_model=ProgressResponse)
async def get_progress(user_id: str) -> ProgressResponse:
    """
    Retrieve a Planeswalker's journey progress.

    Returns all completed phases and current position in the curriculum.
    """
    progress = _progress_store.get(user_id, [])
    return ProgressResponse(user_id=user_id, progress=progress)


@router.post("/progress/{user_id}", response_model=ProgressUpdateResponse)
async def update_progress(user_id: str, update: ProgressUpdate) -> ProgressUpdateResponse:
    """
    Record a Planeswalker's progress through a phase.

    Call this when a user completes a phase or wants to save their code.
    """
    if user_id not in _progress_store:
        _progress_store[user_id] = []

    # Find existing progress for this level/phase or create new
    existing = None
    for entry in _progress_store[user_id]:
        if entry.level_id == update.level_id and entry.phase_id == update.phase_id:
            existing = entry
            break

    if existing:
        existing.completed = update.completed
        if update.code_snapshot:
            existing.code_snapshot = update.code_snapshot
    else:
        _progress_store[user_id].append(ProgressEntry(
            level_id=update.level_id,
            phase_id=update.phase_id,
            completed=update.completed,
            code_snapshot=update.code_snapshot,
        ))

    return ProgressUpdateResponse(
        status="success",
        message="Progress recorded in the Chronicle"
    )
