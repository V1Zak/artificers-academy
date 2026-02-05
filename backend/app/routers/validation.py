"""
Validation Router - The Inspector's Chamber

Endpoints for validating MCP server code (Decklists).
"""

from typing import Optional
from fastapi import APIRouter, Query

from app.models.schemas import ValidationRequest, ValidationResponse
from app.services.ast_validator import validate_code

router = APIRouter()


@router.post("/validate", response_model=ValidationResponse)
async def validate_mcp_code(
    request: ValidationRequest,
    level: Optional[str] = Query(
        None,
        description="Level identifier for level-specific validation (e.g., 'level2', 'level3', 'level4')"
    )
) -> ValidationResponse:
    """
    Submit a Decklist for inspection.

    The Inspector will analyze your Python code and verify:
    - fastmcp import is present
    - FastMCP is properly instantiated
    - All Sorceries (@mcp.tool) have Oracle Text (docstrings)
    - All Permanents (@mcp.resource) have valid URIs

    Level-specific validation:
    - level2: Checks for URI templates and path security
    - level3: Checks for async patterns, httpx, and caching
    - level4: Checks for SSE transport and health endpoints

    Returns a verdict with any Counterspells (errors) encountered.
    """
    return validate_code(request.code, level=level)
