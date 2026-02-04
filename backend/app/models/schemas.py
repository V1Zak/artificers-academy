"""
Pydantic schemas for API request/response models.

In the language of the Grand Artificer:
- ValidationRequest: A Decklist submitted for inspection
- ValidationError: A Counterspell - when a spell fizzles
- ValidationResponse: The Inspector's verdict
"""

from pydantic import BaseModel
from typing import Optional


class ValidationRequest(BaseModel):
    """A Decklist (Python code) submitted for validation."""

    code: str
    """The Python code to validate."""


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


class ProgressUpdate(BaseModel):
    """Progress update for a user's journey through a level."""

    level_id: str
    """The level identifier (e.g., 'level1')."""

    phase_id: str
    """The phase identifier (e.g., 'phase1')."""

    completed: bool = False
    """Whether this phase is completed."""

    code_snapshot: Optional[str] = None
    """Optional code snapshot to save."""


class ProgressResponse(BaseModel):
    """Response containing user's progress data."""

    user_id: str
    """User identifier."""

    progress: list[dict]
    """List of progress entries."""
