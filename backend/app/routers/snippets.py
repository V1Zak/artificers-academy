"""
Snippets Router - The Decklist Archive

Endpoints for managing saved code snippets.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import (
    SnippetCreate,
    SnippetResponse,
    SnippetListResponse,
    SnippetCreateResponse,
    SnippetDeleteResponse,
)
from app.services.database import DatabaseService, DatabaseError, get_database

router = APIRouter()


@router.get("/snippets/{user_id}", response_model=SnippetListResponse)
def get_snippets(
    user_id: str,
    level_id: Optional[str] = None,
    db: DatabaseService = Depends(get_database),
) -> SnippetListResponse:
    """
    Retrieve a Planeswalker's saved Decklists.

    Optionally filter by level_id.

    TODO: Add authentication middleware to verify user_id matches authenticated user.
    """
    try:
        snippets = db.get_snippets(user_id, level_id)
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
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/snippets/{user_id}", response_model=SnippetCreateResponse)
def create_snippet(
    user_id: str,
    snippet: SnippetCreate,
    db: DatabaseService = Depends(get_database),
) -> SnippetCreateResponse:
    """
    Save a new Decklist to the Archive.

    TODO: Add authentication middleware to verify user_id matches authenticated user.
    """
    try:
        snippet_id = db.save_snippet(
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
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/snippets/{user_id}/{snippet_id}", response_model=SnippetDeleteResponse)
def delete_snippet(
    user_id: str,
    snippet_id: str,
    db: DatabaseService = Depends(get_database),
) -> SnippetDeleteResponse:
    """
    Remove a Decklist from the Archive.

    TODO: Add authentication middleware to verify user_id matches authenticated user.
    """
    try:
        deleted = db.delete_snippet(user_id, snippet_id)

        if not deleted:
            raise HTTPException(status_code=404, detail="Decklist not found")

        return SnippetDeleteResponse(
            status="success",
            message="Decklist removed from the Archive"
        )
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))
