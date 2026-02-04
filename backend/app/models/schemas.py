"""
Pydantic schemas for API request/response models.

In the language of the Grand Artificer:
- ValidationRequest: A Decklist submitted for inspection
- ValidationError: A Counterspell - when a spell fizzles
- ValidationResponse: The Inspector's verdict
"""

from pydantic import BaseModel, Field
from typing import Optional


class ValidationRequest(BaseModel):
    """A Decklist (Python code) submitted for validation."""

    code: str = Field(..., max_length=100_000, description="The Python code to validate")
    """The Python code to validate (max 100KB)."""


class ValidationError(BaseModel):
    """A Counterspell - an error found during validation."""

    type: str
    """Error type identifier (e.g., 'missing_import', 'missing_docstring')."""

    line: Optional[int] = None
    """Line number where the error occurred."""

    message: str
    """Human-readable error message in Grand Artificer style."""


class ValidationResponse(BaseModel):
    """The Inspector's verdict on a submitted Decklist."""

    valid: bool
    """Whether the code passes all validation checks."""

    errors: list[ValidationError] = []
    """List of Counterspells (errors) found."""

    tools_found: list[str] = []
    """Names of Sorceries (@mcp.tool) discovered."""

    resources_found: list[str] = []
    """Names of Permanents (@mcp.resource) discovered."""

    prompts_found: list[str] = []
    """Names of Tutors (@mcp.prompt) discovered."""


class ProgressEntry(BaseModel):
    """A single progress entry for a level/phase."""

    level_id: str
    """The level identifier (e.g., 'level1')."""

    phase_id: str
    """The phase identifier (e.g., 'phase1')."""

    completed: bool = False
    """Whether this phase is completed."""

    code_snapshot: Optional[str] = None
    """Optional code snapshot saved by the user."""


class ProgressUpdate(BaseModel):
    """Progress update for a user's journey through a level."""

    level_id: str = Field(..., min_length=1, max_length=50)
    """The level identifier (e.g., 'level1')."""

    phase_id: str = Field(..., min_length=1, max_length=50)
    """The phase identifier (e.g., 'phase1')."""

    completed: bool = False
    """Whether this phase is completed."""

    code_snapshot: Optional[str] = Field(None, max_length=100_000)
    """Optional code snapshot to save (max 100KB)."""


class ProgressResponse(BaseModel):
    """Response containing user's progress data."""

    user_id: str
    """User identifier."""

    progress: list[ProgressEntry]
    """List of progress entries."""


class ProgressUpdateResponse(BaseModel):
    """Response after updating progress."""

    status: str
    """Status of the operation."""

    message: str
    """Human-readable message."""


# ==========================================
# Snippet Models (Decklists)
# ==========================================

class SnippetCreate(BaseModel):
    """Request to save a new code snippet (Decklist)."""

    level_id: str = Field(..., min_length=1, max_length=50)
    """The level this snippet is associated with."""

    title: str = Field(..., min_length=1, max_length=200)
    """Title for the snippet."""

    code: str = Field(..., max_length=100_000)
    """The code content (max 100KB)."""

    is_valid: bool = False
    """Whether the code passed validation."""

    validation_result: Optional[dict] = None
    """Full validation response if available."""


class SnippetResponse(BaseModel):
    """Response containing a saved snippet."""

    id: str
    """Unique snippet identifier."""

    level_id: str
    """The level this snippet is associated with."""

    title: str
    """Title of the snippet."""

    code: str
    """The code content."""

    is_valid: bool
    """Whether the code passed validation."""

    validation_result: Optional[dict] = None
    """Full validation response if available."""

    created_at: Optional[str] = None
    """When the snippet was created."""


class SnippetListResponse(BaseModel):
    """Response containing a list of snippets."""

    snippets: list[SnippetResponse]
    """List of saved snippets."""


class SnippetCreateResponse(BaseModel):
    """Response after creating a snippet."""

    id: str
    """ID of the created snippet."""

    message: str
    """Human-readable message."""


class SnippetDeleteResponse(BaseModel):
    """Response after deleting a snippet."""

    status: str
    """Status of the operation."""

    message: str
    """Human-readable message."""
