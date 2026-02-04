"""
Snippets Router - The Decklist Archive

Endpoints for managing saved code snippets.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.services.database import DatabaseService, get_database

router = APIRouter()


class SnippetCreate(BaseModel):
    """Request to save a new code snippet."""

    level_id: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., max_length=100_000)
    is_valid: bool = False
    validation_result: Optional[dict] = None


class SnippetResponse(BaseModel):
    """Response containing a saved snippet."""

    id: str
    level_id: str
    title: str
    code: str
    is_valid: bool
    validation_result: Optional[dict] = None
    created_at: Optional[str] = None


class SnippetListResponse(BaseModel):
    """Response containing a list of snippets."""

    snippets: list[SnippetResponse]


class SnippetCreateResponse(BaseModel):
    """Response after creating a snippet."""

    id: str
    message: str


@router.get("/snippets/{user_id}", response_model=SnippetListResponse)
async def get_snippets(
    user_id: str,
    level_id: Optional[str] = None,
    db: DatabaseService = Depends(get_database),
) -> SnippetListResponse:
    """
    Retrieve a Planeswalker's saved Decklists.

    Optionally filter by level_id.
    """
    snippets = await db.get_snippets(user_id, level_id)
    return SnippetListResponse(
        snippets=[
            SnippetResponse(
                id=s["id"],
                level_id=s["level_id"],
                title=s["title"],
                code=s["code"],
                is_valid=s["is_valid"],
                validation_result=s.get("validation_result"),
                created_at=s.get("created_at"),
            )
            for s in snippets
        ]
    )


@router.post("/snippets/{user_id}", response_model=SnippetCreateResponse)
async def create_snippet(
    user_id: str,
    snippet: SnippetCreate,
    db: DatabaseService = Depends(get_database),
) -> SnippetCreateResponse:
    """
    Save a new Decklist to the Archive.
    """
    snippet_id = await db.save_snippet(
        user_id=user_id,
        level_id=snippet.level_id,
        title=snippet.title,
        code=snippet.code,
        is_valid=snippet.is_valid,
        validation_result=snippet.validation_result,
    )

    return SnippetCreateResponse(
        id=snippet_id,
        message="Decklist saved to the Archive"
    )


@router.delete("/snippets/{user_id}/{snippet_id}")
async def delete_snippet(
    user_id: str,
    snippet_id: str,
    db: DatabaseService = Depends(get_database),
) -> dict:
    """
    Remove a Decklist from the Archive.
    """
    deleted = await db.delete_snippet(user_id, snippet_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Decklist not found")

    return {"status": "success", "message": "Decklist removed from the Archive"}
