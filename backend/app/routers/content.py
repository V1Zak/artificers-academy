"""
Content router for curriculum and learning materials.

Serves the level/phase structure and markdown content for
The Artificer's Academy learning platform.
"""

import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    CurriculumResponse,
    Level,
    Phase,
    PhaseContentResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)

# Path to content directory (relative to backend root)
CONTENT_DIR = Path(__file__).parent.parent.parent / "content"
CURRICULUM_FILE = CONTENT_DIR / "curriculum.json"


def _load_curriculum() -> dict:
    """Load and parse the curriculum JSON file."""
    if not CURRICULUM_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Curriculum configuration not found",
        )

    try:
        with open(CURRICULUM_FILE) as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse curriculum.json: {e}")
        raise HTTPException(
            status_code=500,
            detail="Invalid curriculum configuration",
        )


@router.get("/curriculum", response_model=CurriculumResponse)
async def get_curriculum() -> CurriculumResponse:
    """
    Get the full curriculum structure.

    Returns all levels and their phases (without content).
    """
    data = _load_curriculum()

    levels = []
    for level_data in data.get("levels", []):
        phases = [
            Phase(**phase_data)
            for phase_data in level_data.get("phases", [])
        ]
        level = Level(
            id=level_data["id"],
            title=level_data["title"],
            subtitle=level_data["subtitle"],
            description=level_data["description"],
            mana_color=level_data["mana_color"],
            phases=phases,
            locked=level_data.get("locked", False),
        )
        levels.append(level)

    return CurriculumResponse(levels=levels)


@router.get("/levels/{level_id}", response_model=Level)
async def get_level(level_id: str) -> Level:
    """
    Get a specific level by ID.

    Returns the level structure with all phases (without content).
    """
    data = _load_curriculum()

    for level_data in data.get("levels", []):
        if level_data["id"] == level_id:
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

    raise HTTPException(
        status_code=404,
        detail=f"Level '{level_id}' not found in the archives",
    )


@router.get(
    "/levels/{level_id}/phases/{phase_id}",
    response_model=PhaseContentResponse,
)
async def get_phase_content(level_id: str, phase_id: str) -> PhaseContentResponse:
    """
    Get the content for a specific phase.

    Returns the markdown content for the tutorial/lesson.
    """
    data = _load_curriculum()

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

    # Load the content file
    content_file = CONTENT_DIR / phase_data["content_file"]
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
