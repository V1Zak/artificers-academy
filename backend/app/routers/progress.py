"""
Progress Router - The Chronicle of Journeys

Endpoints for tracking user progress through the curriculum
and managing user learning mode preferences.
"""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.models.schemas import (
    VALID_MODES,
    ProgressUpdate,
    ProgressResponse,
    ProgressUpdateResponse,
    UserPreference,
    UserPreferenceUpdate,
)
from app.services.database import DatabaseService, DatabaseError, get_database

router = APIRouter()


@router.get("/progress/{user_id}", response_model=ProgressResponse)
def get_progress(
    user_id: str,
    mode: str = Query(default="mtg", description="Learning mode filter"),
    db: DatabaseService = Depends(get_database),
) -> ProgressResponse:
    """
    Retrieve a user's journey progress, filtered by learning mode.
    """
    if mode not in VALID_MODES:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}. Must be one of {VALID_MODES}")

    try:
        progress = db.get_progress(user_id, mode=mode)
        return ProgressResponse(user_id=user_id, progress=progress)
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/progress/{user_id}", response_model=ProgressUpdateResponse)
def update_progress(
    user_id: str,
    update: ProgressUpdate,
    db: DatabaseService = Depends(get_database),
) -> ProgressUpdateResponse:
    """
    Record a user's progress through a phase.
    """
    try:
        db.upsert_progress(
            user_id=user_id,
            level_id=update.level_id,
            phase_id=update.phase_id,
            completed=update.completed,
            code_snapshot=update.code_snapshot,
            mode=update.mode,
        )

        return ProgressUpdateResponse(
            status="success",
            message="Progress recorded in the Chronicle"
        )
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preferences/{user_id}", response_model=UserPreference)
def get_preference(
    user_id: str,
    db: DatabaseService = Depends(get_database),
) -> UserPreference:
    """Get a user's learning mode preference."""
    active_mode = db.get_user_preference(user_id)
    return UserPreference(user_id=user_id, active_mode=active_mode)


@router.put("/preferences/{user_id}", response_model=UserPreference)
def set_preference(
    user_id: str,
    update: UserPreferenceUpdate,
    db: DatabaseService = Depends(get_database),
) -> UserPreference:
    """Set a user's learning mode preference."""
    try:
        db.set_user_preference(user_id, update.active_mode)
        return UserPreference(user_id=user_id, active_mode=update.active_mode)
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))
