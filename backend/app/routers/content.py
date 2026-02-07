"""
Content router for curriculum and learning materials.

Serves the level/phase structure and markdown content for
The Artificer's Academy learning platform. Supports multiple
learning modes (simple, detailed, mtg).
"""

import json
import logging
import re
from functools import lru_cache
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Path as PathParam, Query

from app.models.schemas import (
    VALID_MODES,
    CurriculumResponse,
    Level,
    Phase,
    PhaseContentResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)

# Path to content directory (relative to backend root)
CONTENT_DIR = Path(__file__).parent.parent.parent / "content"

# Pattern for valid IDs (alphanumeric, underscores, hyphens)
VALID_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]+$")


def _validate_id(value: str, name: str) -> None:
    """Validate that an ID contains only safe characters."""
    if not VALID_ID_PATTERN.match(value):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {name}: must contain only alphanumeric characters, underscores, and hyphens",
        )


def _validate_mode(mode: str) -> None:
    """Validate the learning mode parameter."""
    if mode not in VALID_MODES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mode: {mode}. Must be one of {VALID_MODES}",
        )


def _get_curriculum_file(mode: str) -> Path:
    """Get the curriculum JSON file path for a given mode."""
    return CONTENT_DIR / f"curriculum-{mode}.json"


def _validate_content_path(content_file: str) -> Path:
    """
    Validate and resolve a content file path safely.

    Prevents path traversal attacks by ensuring the resolved path
    stays within CONTENT_DIR.
    """
    # Build the full path
    full_path = (CONTENT_DIR / content_file).resolve()

    # Ensure it's within CONTENT_DIR (prevent path traversal)
    try:
        full_path.relative_to(CONTENT_DIR.resolve())
    except ValueError:
        logger.warning(f"Path traversal attempt detected: {content_file}")
        raise HTTPException(
            status_code=400,
            detail="Invalid content path",
        )

    return full_path


@lru_cache(maxsize=3)
def _load_curriculum_cached(mode: str) -> str:
    """Load curriculum JSON as string (cached for lru_cache compatibility)."""
    curriculum_file = _get_curriculum_file(mode)

    if not curriculum_file.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Curriculum configuration not found for mode: {mode}",
        )

    try:
        return curriculum_file.read_text(encoding="utf-8")
    except IOError as e:
        logger.error(f"Failed to read curriculum-{mode}.json: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to load curriculum configuration",
        )


def _load_curriculum(mode: str = "mtg") -> dict:
    """Load and parse the curriculum JSON file (with caching)."""
    try:
        return json.loads(_load_curriculum_cached(mode))
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse curriculum-{mode}.json: {e}")
        raise HTTPException(
            status_code=500,
            detail="Invalid curriculum configuration",
        )


def _parse_level(level_data: dict) -> Level:
    """Parse a level dict into a Level model."""
    phases = [
        Phase(**phase_data)
        for phase_data in level_data.get("phases", [])
    ]
    return Level(
        id=level_data["id"],
        title=level_data["title"],
        subtitle=level_data["subtitle"],
        description=level_data["description"],
        mana_color=level_data["mana_color"],
        phases=phases,
        locked=level_data.get("locked", False),
    )


@router.get("/curriculum", response_model=CurriculumResponse)
async def get_curriculum(
    mode: str = Query(default="mtg", description="Learning mode"),
) -> CurriculumResponse:
    """
    Get the full curriculum structure.

    Returns all levels and their phases (without content).
    """
    _validate_mode(mode)
    data = _load_curriculum(mode)
    levels = [_parse_level(level_data) for level_data in data.get("levels", [])]
    return CurriculumResponse(levels=levels)


@router.get("/levels/{level_id}", response_model=Level)
async def get_level(
    level_id: str = PathParam(..., min_length=1, max_length=50),
    mode: str = Query(default="mtg", description="Learning mode"),
) -> Level:
    """
    Get a specific level by ID.

    Returns the level structure with all phases (without content).
    """
    _validate_mode(mode)
    _validate_id(level_id, "level_id")
    data = _load_curriculum(mode)

    for level_data in data.get("levels", []):
        if level_data["id"] == level_id:
            return _parse_level(level_data)

    raise HTTPException(
        status_code=404,
        detail=f"Level '{level_id}' not found in the archives",
    )


@router.get(
    "/levels/{level_id}/phases/{phase_id}",
    response_model=PhaseContentResponse,
)
async def get_phase_content(
    level_id: str = PathParam(..., min_length=1, max_length=50),
    phase_id: str = PathParam(..., min_length=1, max_length=50),
    mode: str = Query(default="mtg", description="Learning mode"),
) -> PhaseContentResponse:
    """
    Get the content for a specific phase.

    Returns the markdown content for the tutorial/lesson.
    """
    _validate_mode(mode)
    _validate_id(level_id, "level_id")
    _validate_id(phase_id, "phase_id")

    data = _load_curriculum(mode)

    # Find the level
    level_data: Optional[dict] = None
    for lvl in data.get("levels", []):
        if lvl["id"] == level_id:
            level_data = lvl
            break

    if not level_data:
        raise HTTPException(
            status_code=404,
            detail=f"Level '{level_id}' not found in the archives",
        )

    # Find the phase
    phase_data: Optional[dict] = None
    for phase in level_data.get("phases", []):
        if phase["id"] == phase_id:
            phase_data = phase
            break

    if not phase_data:
        raise HTTPException(
            status_code=404,
            detail=f"Phase '{phase_id}' not found in level '{level_id}'",
        )

    # Validate and load the content file
    content_file = _validate_content_path(phase_data["content_file"])

    if not content_file.exists():
        logger.error(f"Content file not found: {content_file}")
        raise HTTPException(
            status_code=500,
            detail="Phase content not available",
        )

    try:
        content = content_file.read_text(encoding="utf-8")
    except IOError as e:
        logger.error(f"Failed to read content file: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to load phase content",
        )

    return PhaseContentResponse(
        level_id=level_id,
        phase_id=phase_id,
        title=phase_data["title"],
        content=content,
    )
